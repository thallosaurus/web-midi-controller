#/bin/sh
cd web 
VERSION=$(npm version patch)
git add web/package.json
cd ..
cargo bump patch
git add Cargo.toml
git add Cargo.lock
git commit -m "Bump: $VERSION"