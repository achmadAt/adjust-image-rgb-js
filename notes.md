- note for brightness

```
Certainly, here's the logic of that part of the code step by step:

brightnessFactor is calculated based on the value provided. This factor is used to determine how much brighter or darker to make the image. If value is positive, it makes the image brighter; if negative, it makes it darker. The calculated brightnessFactor is scaled to fit between 0 and 255.

The code starts by opening the image specified in inputImagePath using the Jimp library.

Two nested loops are used to go through every pixel in the image. Imagine this like looking at each tiny square in a big picture.

For each pixel, it gets the current color. Colors are made up of red (r), green (g), blue (b), and alpha (a) values. Alpha controls how transparent or opaque a color is.

The code then takes the red, green, and blue values (r, g, and b) and adjusts them using the brightnessFactor:

It adds brightnessFactor to each color value if brightnessFactor is positive, which makes the colors brighter.
It subtracts brightnessFactor from each color value if brightnessFactor is negative, which makes the colors darker.
The result is clamped between 0 and 255 to ensure that the colors don't go beyond the valid range.
After adjusting the red, green, and blue values, a new color is created using Jimp.rgbaToInt() with the modified values and the original alpha value (transparency).

```

```
try change a property to increase shadow
```