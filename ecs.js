import ecsPublish from './lib/index.js';
//import fs from 'fs'

//const privateKey = fs.readFileSync('./.ssh/id_ecdsa')

ecsPublish({
  "baseDir": "build", //你要发布的目录，dist or build or other...，本地的
  "targetHost":"",//远端服务器地址
  "targetPort": "22",
  "username": "root",
  "password": "", // password || privateKey, 两个参数必须有一个
  //"privateKey": privateKey, //值，不能是路径
  //"passphrase": undefined,
  "targetDir": "/var/www/html", //远端绝对路径, 这个路径是默认nginx放文件的路径
  "clearBeforePublish": true, //是否先清空， 这个得看具体的情况，如果nginx上是在/var/www/html下做多层，那targetDir就需要多一层了
})
