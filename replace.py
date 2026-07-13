import glob
import os

files = glob.glob('*.html')
files = [f for f in files if f != 'index.html']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('"index.html"', '"home.html"').replace("'index.html'", "'home.html'")
    
    if content != new_content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
