import sys,glob
from PIL import Image
pat,out=sys.argv[1],sys.argv[2]
fs=sorted(glob.glob(pat))[:12]
ims=[Image.open(f).convert('RGB') for f in fs]
w=max(i.width for i in ims);h=max(i.height for i in ims)
cols=3;rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h),'white')
for k,im in enumerate(ims):S.paste(im,((k%cols)*w,(k//cols)*h))
S.save(out)
