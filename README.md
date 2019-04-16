# ethereum-kickstarter-campaign

*Run Kickstarter campaigns in Ethereum*

### How to start

1. Go to the project root directory
1. Set Node.js version to be 10.13.0
1. Run `yarn install` to install all packages
1. Create file *config.js* in *ethereum/config* directory
1. Declare, initialize and export these two variables accordingly: *mnemonic* and *rinkebyAddress* 
1. Run `node ethereum/scripts/compile.js`
1. Run `node ethereum/scripts/deploy.js`
1. Copy the *address* of the deployed contract (CampaignFactory) from console log
1. Set the *address* variable in *ethereum/instances/factory.js*
1. Run `yarn dev` to start on development environment
