#!/usr/bin/env node
import ecsPublish from "../lib/index.js";
import fs from "fs-extra";
import path from "path";
import { Command } from "commander/esm.mjs";
import untildify from "untildify";

const program = new Command();

// 目前仅支持password方式，密钥还存在问题
//命令行 ecs-publish

function getEcsOptions() {
  program.option("-c, --config <string>", "config file path");
  program.option("-pk, --privateKey <string>", "privateKey path");

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

  //先用默认的configJson中的privateKey
  if(!!configJson.privateKey){
    const privatekeyPath = untildify(configJson.privateKey)
    if (!fs.existsSync(privatekeyPath)) {
      console.error("\x1b[31m", "can not find privateKey file", "\x1b[m");
      process.exit(1);
    }
    configJson.privateKey = fs.readFileSync(privatekeyPath)
  }

  //由命令行决定的privateKey优先级更高
  //如果有options.privateKey, 用它，否则默认用
  if(!!options.privateKey || !!process.env?.privateKey){
    const privatekeyPath = untildify(options.privateKey)
    if (!fs.existsSync(privatekeyPath)) {
      console.error("\x1b[31m", "[c|e] can not find privateKey file", "\x1b[m");
      process.exit(1);
    }
    configJson.privateKey = fs.readFileSync(privatekeyPath)
  }

  configJson = checkConfigJson(configJson);
  return configJson;
}

function checkConfigJson(configJson) {

  if (!configJson.targetHost) {
    console.error("\x1b[31m", "can not find targetHost param", "\x1b[m");
    process.exit(1);
  }

  if (!configJson.targetPort) {
    console.error("\x1b[31m", "can not find targetPort param", "\x1b[m");
    process.exit(1);
  }

  if (!configJson.targetDir) {
    console.error("\x1b[31m", "can not find targetDir param", "\x1b[m");
    process.exit(1);
  }

  if (!fs.existsSync(configJson.baseDir)) {
    console.error("\x1b[31m", "baseDir is not exist", "\x1b[m");
    process.exit(1);
  }

  if (!configJson.username) {
    console.error("\x1b[31m", "username is not exist", "\x1b[m");
    process.exit(1);
  }

  if (!configJson.password && !configJson.privateKey) {
    console.error("\x1b[31m", "password or privateKey is not exist", "\x1b[m");
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
