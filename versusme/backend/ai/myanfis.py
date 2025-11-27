import os, logging
logging.getLogger('tensorflow').disabled = True
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf
from tensorflow import keras
import numpy as np
from tensorflow.keras.saving import register_keras_serializable


def equally_spaced_initializer(shape, minval=-1.5, maxval=1.5, dtype=tf.float32):
    linspace = tf.reshape(tf.linspace(minval, maxval, shape[0]), (-1,1))
    return tf.tile(linspace, (1, shape[1]))

@register_keras_serializable(name="FuzzyLayer")
class FuzzyLayer(keras.layers.Layer):
    def __init__(self, n_input, n_memb, **kwargs):
        super().__init__(**kwargs)
        self.n = int(n_input)
        self.m = int(n_memb)
    def build(self, input_shape):
        self.mu = self.add_weight(shape=(self.m, self.n),
                                  initializer=equally_spaced_initializer,
                                  trainable=True, name='mu')
        self.sigma = self.add_weight(shape=(self.m, self.n),
                                     initializer=keras.initializers.RandomUniform(minval=.7, maxval=1.3, seed=1),
                                     trainable=True, name='sigma')
        super().build(input_shape)
    def get_config(self):
        cfg = super().get_config(); cfg.update({"n_input": self.n, "n_memb": self.m}); return cfg
    @tf.function
    def call(self, x_inputs):
        B = tf.shape(x_inputs)[0]
        tiled = tf.reshape(tf.tile(x_inputs, (1, self.m)), (B, self.m, self.n))
        return tf.exp(-tf.square(tiled - self.mu) / (tf.square(self.sigma) + 1e-8))

@register_keras_serializable(name="RuleLayer")
class RuleLayer(keras.layers.Layer):
    def __init__(self, n_input, n_memb, **kwargs):
        super().__init__(**kwargs); self.n = int(n_input); self.m = int(n_memb)
    def get_config(self):
        cfg = super().get_config(); cfg.update({"n_input": self.n, "n_memb": self.m}); return cfg
    @tf.function
    def call(self, L1):
        w = L1[:, :, 0]
        for k in range(1, self.n):
            a = tf.expand_dims(w, 2); b = tf.expand_dims(L1[:, :, k], 1)
            w = tf.reshape(a * b, (tf.shape(L1)[0], -1))
        return w

@register_keras_serializable(name="NormLayer")
class NormLayer(keras.layers.Layer):
    def get_config(self): return super().get_config()
    @tf.function
    def call(self, w):
        w_sum = tf.reduce_sum(w, axis=1, keepdims=True) + 1e-8
        return w / w_sum

@register_keras_serializable(name="DefuzzLayer")
class DefuzzLayer(keras.layers.Layer):
    def __init__(self, n_input, n_memb, **kwargs):
        super().__init__(**kwargs); self.n = int(n_input); self.m = int(n_memb)
    def build(self, input_shape):
        self.CP_bias = self.add_weight(shape=(1, self.m ** self.n),
                                       initializer=keras.initializers.RandomUniform(minval=-2, maxval=2),
                                       trainable=True, name='Consequence_bias')
        self.CP_weight = self.add_weight(shape=(self.n, self.m ** self.n),
                                         initializer=keras.initializers.RandomUniform(minval=-2, maxval=2),
                                         trainable=True, name='Consequence_weight')
        super().build(input_shape)
    def get_config(self):
        cfg = super().get_config(); cfg.update({"n_input": self.n, "n_memb": self.m}); return cfg
    @tf.function
    def call(self, w_norm, input_):
        return w_norm * (tf.matmul(input_, self.CP_weight) + self.CP_bias)

@register_keras_serializable(name="SummationLayer")
class SummationLayer(keras.layers.Layer):
    def get_config(self): return super().get_config()
    @tf.function
    def call(self, input_):
        out = tf.reduce_sum(input_, axis=1)
        return tf.reshape(out, (-1,1))

class ANFIS:
    def __init__(self, n_input, n_memb, name='MyAnfis'):
        self.n = int(n_input); self.m = int(n_memb)
        self.model = self._build_model(self.n, self.m, name)
    def _build_model(self, n_input, n_memb, name):
        x = keras.layers.Input(shape=(n_input,), name='inputLayer')
        L1 = FuzzyLayer(n_input, n_memb, name='fuzzyLayer')(x)
        L2 = RuleLayer(n_input, n_memb, name='ruleLayer')(L1)
        L3 = NormLayer(name='normLayer')(L2)
        L4 = DefuzzLayer(n_input, n_memb, name='defuzzLayer')(L3, x)
        L5 = SummationLayer(name='sumLayer')(L4)
        return keras.Model(inputs=[x], outputs=[L5], name=name)
    def fit(self, X, y, **kwargs):
        self.model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return self.model.fit(X, y, **kwargs)
    def save(self, path):
        self.model.save(path)
