from PIL import Image

data = Image.open("img10.jpg")
print(data.getpixel(1,1))