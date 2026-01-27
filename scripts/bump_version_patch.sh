#/bin/sh
cd web 
VERSION=$(npm version patch)
git add .
git commit -m "New UI Version: $VERSION"
cd ..
cargo bump patch -g