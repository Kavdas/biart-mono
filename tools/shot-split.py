# Режет длинный скриншот на куски по 1800px: python tools/shot-split.py full.png
import sys; from PIL import Image
im=Image.open(sys.argv[1]); h=im.height; n=0; base=sys.argv[1][:-4]
for y in range(0,h,1800):
    im.crop((0,y,im.width,min(y+1800,h))).save(f"{base}-{n}.png"); n+=1
print(im.size, n)
