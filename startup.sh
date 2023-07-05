#!/bin/bash
yum update -y
yum install httpd -y
yum install git -y
git version
service httpd start
chkconfig httpd on
cat > /tmp/subscript.sh << EOF
# START
echo "Setting up NodeJS Environment"
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

echo 'export NVM_DIR="/home/ec2-user/.nvm"' >> /home/ec2-usr/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> /home/ec2-user/.bashrc

# Dot source the files to ensure that variables are available within the current shell
. /home/ec2-user/.nvm/nvm.sh
. /home/ec2-user/.bashrc

# Install NVM, NPM, Node.JS & Grunt
nvm alias default v16.20.0
nvm install v16.20.0
nvm use v16.20.0

curl -o- -L https://yarnpkg.com/install.sh | bash
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"


yarn global add pm2
yarn install
EOF

# pm2 start index.js --name "discord-bot"