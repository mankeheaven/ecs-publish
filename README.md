# ecs-publish
发布静态资源到服务器上的某个目录下

### 如何使用

1. 安装
```
npm install @mankeheaven/ecs-publish --save-dev
```

2. 命令行发布使用方式
编写配置文件ecs-publish.json， 目前仅支持json配置文件
```
{
  "baseDir": "build", //你要发布的目录，dist or build or other...，本地的
  "targetHost":"",//远端服务器地址
  "targetPort": "22",
  "username": "",
  "password": "", // 目前仅支持密码的方式
  "targetDir": "/var/www/html", //远端绝对路径, 这个路径是默认nginx放文件的路径
  "clearBeforePublish": true, //是否先清空， 这个得看具体的情况，如果nginx上是在/var/www/html下做多层，那targetDir就需要多一层了
}
```
或者配置文件改名字，xxx.json

编写scripts脚本,如果你的配置名称就是ecs-publish.json，可以省略--config, 可以省略privateKey参数，它会从ecs-publish.json中找，优先级从命令行和env上拿的更高

```
ecs-publish --config xxx.json --privateKey 路径
```

"privateKey" : "~/.ssh/id_rsa", 可以换成其他路径

3. 脚本发布，参考ecs.js

