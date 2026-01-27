#/bin/sh
cd web 
VERSION=$(npm version patch)
git add web/package.json
cargo bump patch
git commit -m "Bump: $VERSION"