# !usr/bin/python

import matplotlib.pyplot as plt
import os

# TODO: replace with none hard-code path
# Note: mb use ts commands in benchmark plus ...args in python cli
with open('../measurements/strings/fakerGeneratorString.txt', 'r') as file:
    lines = file.readlines()

x_data = []
y_data = []

for line in lines:
    x, y = map(float, line.strip().split())
    x_data.append(x)
    y_data.append(y)

plt.figure(figsize=(10, 6))
plt.xlabel('length')
plt.grid()

# TODO: replace with none hard-code name
plt.plot(x_data, y_data, 'red', label='fakerGeneratorString')
plt.ylim(0, 1)
plt.legend()
plt.show()

# TODO: replace with none hard-code name
plt.savefig('charts/fakerGeneratorString.png')