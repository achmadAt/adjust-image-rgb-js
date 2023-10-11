import cv2
import numpy as np
# Load an image (replace 'input.jpg' with your image file)
image = cv2.imread("img10.jpg")
# Convert the image to grayscale
# Apply a sharpening kernel to the image
sharpening_kernel = np.array([[0, -0.5, 0],
                            [-0.5, 3, -0.5],
                            [0, -0.5, 0],])
sharpened_image = cv2.filter2D(image, -1, sharpening_kernel)

cv2.imwrite("output.jpg", sharpened_image)