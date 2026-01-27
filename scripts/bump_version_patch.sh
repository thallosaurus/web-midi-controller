#/bin/sh
cd web 
VERSION=$(npm version patch)
git add .
cd ..
cargo bump patch -g
#git commit -m "Bump: $VERSION"