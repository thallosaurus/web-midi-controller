#/bin/sh
cd web 
VERSION=$(npm version patch)
git add .
cd ..
cargo bump patch
git add .
#git commit -m "Bump: $VERSION"