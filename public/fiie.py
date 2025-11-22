import os

def rename_images(folder_path):
    # Allowed image extensions
    image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}

    files = os.listdir(folder_path)
    images = [f for f in files if os.path.splitext(f)[1].lower() in image_exts]

    # Sort files alphabetically before renaming
    images.sort()

    for i, filename in enumerate(images, start=1):
        old_path = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1]
        new_name = f"image{i}{ext}"
        new_path = os.path.join(folder_path, new_name)

        os.rename(old_path, new_path)
        print(f"Renamed: {filename}  →  {new_name}")

    print("\nDone! All images renamed successfully.")

# Example usage:
# rename_images("C:/Users/YourName/Desktop/photos")
rename_images("./")