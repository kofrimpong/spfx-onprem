## Build SharePoint Framework solutions for on-premises SharePoint with ANY version of React, TypeScript or Office UI Fabric React

## How to run

`$ npm i` in _externals_ folder

`$ npm i` in _spfx_ folder

## Development flow
In your externals lib folder run 

`$ npm run watch`

It will spin up a webpack watch process, and gulp watch process as well. Gulp watcher is responsible for reloading our web part when source code changes, and for coping TypeScript definitions for resources. 

In SharePoint Framework solution folder simply run

`$ gulp serve`

## Production flow
For production in your externals repo run 

`$ npm run build`

This will pack your solution using production settings. 

Then in SharePoint Framework solution folder run

`$ gulp bundle --ship`

`$ gulp package-solution --ship`

This will pack your SharePoint Framework package, it will be ready to distribution.

--- 
Blog post - [Build SharePoint Framework solutions for on-premises SharePoint with ANY version of React, TypeScript or Office UI Fabric React](https://spblog.net/post/2019/08/08/build-sharepoint-framework-solutions-for-on-premises-sharepoint-with-any-version-of-react-typescript-or-office-ui-fabric-react)

---
If you experience sass module issues, run 

`npm rebuild node-sass`

### Node versions
1. Use node 10.21.0 to install in both `external` and `spfx` folder
2. Use node 10.21.0 to build `external`
3. Use node 6.17.1 or 10.21.0 to build `spfx`
