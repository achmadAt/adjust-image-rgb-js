import cv2
import numpy as np


def adjust_contrast(image, factor):
    alpha = 1 + factor / 200
    beta = 128 - alpha * 128
    adjusted_image = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)

    return adjusted_image


inputs = [-100, -70,-50, -20, 20,50, 70, 100]
for i, val in enumerate(inputs):
  img = cv2.imread('input.jpeg')
  img = adjust_contrast(img, val)
  cv2.imwrite(filename=f"{val}.jpg", img=img)