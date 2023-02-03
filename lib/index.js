import fs from "fs-extra";
import path from "path";
import ProgressBar from "progress";
import { Client } from "node-scp";

async function ecsPublish(options) {
  const store = await new Client({
    host: options.targetHost,
    port: parseInt(options.targetPort.toString()),
    username: options.username,
    password: options?.password,
    privateKey: options?.privateKey, //是buffer
    passphrase: options?.passphrase,
    //debug: (m)=>console.log(m)
  });

  const files2publish = [];

  //检查一遍targetDir, 如果不存在，直接抛错，免得误判了（请人工确保目标一定有这个目录，否则发布失败）
  try {
    console.log("远端目录", options.targetDir);
    const result = await store.exists(options.targetDir);
    if (!result) {
      console.error(`远端服务器目录不存在，发布失败`);
      store.close();
      return;
    }
  } catch (error) {
    console.error(`判断远端目录存在失败，发布失败`);
    store.close();
    return;
  }

  //检查是否需要提前清空
  if (options.clearBeforePublish) {
    try {
      await store.emptyDir(options.targetDir);
      console.info("清理了目录内容");
    } catch (error) {
      console.info("清理目录内容失败：", error);
      store.close();
      return;
    }
  }

  console.log("扫描文件中...");
  let readBar = new ProgressBar("已扫描:atotal个文件", {
    total: 0,
  });
  await calculate(
    path.join(process.cwd(), options.baseDir),
    path.join(process.cwd(), options.baseDir)
  );
  readBar.tick({
    atotal: files2publish.length,
  });

  //遍历上传
  console.info("开始上传...");
  try {
    await store.uploadDir(options.baseDir, options.targetDir);
    console.info("上传结束.");
  } catch (e) {
    console.error("上传有错误:", e);
  } finally {
    store.close();
  }

  //递归计算
  async function calculate(baseDir, prefixDir) {
    const files = await fs.readdir(prefixDir);
    if (!files.length) {
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(prefixDir, files[i]);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        await calculate(baseDir, path.join(prefixDir, files[i]));
      } else if (stat.isFile) {
        const relativePath = path.relative(baseDir, filePath);
        const name = path.normalize(relativePath);
        const remoteFilePath = path
          .join(options.targetDir, name)
          .split("\\")
          .join("/");
        files2publish.push({
          name: name.split("\\").join("/"),
          filePath,
          remoteFilePath,
        });
      }
    }
  }
}

export default ecsPublish;
