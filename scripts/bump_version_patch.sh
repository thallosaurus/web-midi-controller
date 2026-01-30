#/bin/sh
cd web 
VERSION=$(npm version patch)

git add .
git commit -m "New UI Version: $VERSION"
cd ..
cargo workspaces version patch --no-individual-tags --no-git-push
# git add .
# git commit -m "New Backend Version: $VERSION"
# git tag $VERSION