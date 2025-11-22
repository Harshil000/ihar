import os
import re

def rename_images(folder_path):
    image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}

    files = os.listdir(folder_path)

    # Detect already numbered images: image<number>.<ext>
    pattern = re.compile(r"image(\d+)\.(jpg|jpeg|png|gif|webp|bmp)$", re.IGNORECASE)
    
    max_number = 0
    unnumbered_images = []

    for f in files:
        name, ext = os.path.splitext(f)
        ext_lower = ext.lower()

        if ext_lower in image_exts:
            match = pattern.match(f)
            if match:
                num = int(match.group(1))
                max_number = max(max_number, num)
            else:
                unnumbered_images.append(f)

    # Sort unnumbered images before renaming
    unnumbered_images.sort()

    # Start numbering from next available number
    start = max_number + 1

    for i, filename in enumerate(unnumbered_images, start=start):
        old_path = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1]
        new_name = f"image{i}{ext}"
        new_path = os.path.join(folder_path, new_name)

        os.rename(old_path, new_path)
        print(f"Renamed: {filename}  →  {new_name}")

    print("\nDone! All new images renamed successfully.")

# Example:
# rename_images("C:/Users/YourName/Desktop/photos")
rename_images("./")