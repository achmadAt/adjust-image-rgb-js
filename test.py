from PIL import Image, ImageDraw, ImageEnhance

def adjust_shadow(image_path, shadow_level):
    # Open the image
    image = Image.open(image_path).convert("RGBA")

    # Create a new image with the same size as the original image
    shadow_image = Image.new("RGBA", image.size)

    # Create a Draw object
    draw = ImageDraw.Draw(shadow_image)

    # Draw a shadow shape on the new image
    shadow_color = (0, 0, 0, shadow_level)
    draw.rectangle((0, 0, image.width, image.height), fill=shadow_color)

    # Combine the original image and the shadow image
    result_image = Image.alpha_composite(image, shadow_image)
    # Adjust the brightness of the resulting image
    enhancer = ImageEnhance.Brightness(result_image)
    result_image = enhancer.enhance(1.0 + (shadow_level / 100))

    return result_image


input_image_path = "img10.jpg"
output_image_path = "img10_edited.jpg"
shadow_level = 50

result_image = adjust_shadow(input_image_path, shadow_level)
# Image.new("RGBA", size=result_image.size, color=rgba_to_integer(result_image))
result_image = result_image.convert('RGB')
result_image.save(output_image_path)
