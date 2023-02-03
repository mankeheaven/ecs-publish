#!/usr/bin/env node
import ecsPublish from "../lib/index.js";
import fs from "fs-extra";
import path from "path";
import { Command } from "commander/esm.mjs";

const program = new Command();

// 目前仅支持password方式，密钥还存在问题
//命令行 ecs-publish

function getEcsOptions() {
  ///region/endpoint, accessKeyId, accessKeySecret, bucket
  program.option("-c, --config", "config file path");

  program.parse(process.argv);

  const options = program.opts();
  let configPath = null;

  //不在参数上设置配置文件路径，就找一次默认文件
  if (!options.config) {
    const defaultConfigPath = path.join(process.cwd(), "ecs-publish.json");
    if (!fs.existsSync(defaultConfigPath)) {
      console.error(
        "\x1b[31m",
        "can not find config file ecs-publish.json",
        "\x1b[m"
      );
      process.exit(1);
    } else {
      configPath = defaultConfigPath;
    }
  } else {
    configPath = path.join(options.config);
    if (!fs.existsSync(configPath)) {
      console.error("\x1b[31m", "can not find config file", "\x1b[m");
      process.exit(1);
    }
  }
  //找到了文件，读取
  let configJson = fs.readJsonSync(configPath);
  configJson = checkConfigJson(configJson);
  return configJson;
}

function checkConfigJson(configJson) {
  if (!configJson.type) {
    configJson.type = "ali";
  }

  if (!configJson.targetDir) {
    console.error("\x1b[31m", "can not find targetDir param", "\x1b[m");
    process.exit(1);
  }

  if (!configJson.targetHost) {
    console.error("\x1b[31m", "can not find targetHost param", "\x1b[m");
    process.exit(1);
  }

  if (!configJson.targetPort) {
    console.error("\x1b[31m", "can not find targetPort param", "\x1b[m");
    process.exit(1);
  }
  if (!fs.existsSync(configJson.baseDir)) {
    console.error("\x1b[31m", "baseDir is not exist", "\x1b[m");
    process.exit(1);
  }

  return configJson;
}

function getAllOptions() {
  const configJson = getEcsOptions();

  return {
    ...configJson,
  };
}

const options = getAllOptions();
ecsPublish(options);
