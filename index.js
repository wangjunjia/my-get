#! /bin/env node
const util = require('node:util')
const { spawn, exec: nodeExec } = require('node:child_process')
const exec = util.promisify(nodeExec)
const argv = require('minimist')(process.argv.slice(2))

const pkg = require('./package.json')
console.log(`
${pkg.name} <${pkg.version}> ${pkg.description}
`)

if (argv.h || argv.help || argv.v || argv.version) {
  console.log(`usage: my-get [options] args
options:
  --debug: 调试模式
  -h, --help: 打印帮助
  -v, --version: 输出版本

args:
  --url: 视频地址
  --bv: B站bv号，和 url 二者取一
  --end: 总数量或者最后一个
  --begin: 自定义第一个，（可选，默认从第一个开始）
`)
  process.exit()
}

if (argv.debug) {
  console.log('[debug]:')
  console.log(argv)
  console.log()
}

if (!argv.url && !argv.bv) {
  console.log('使用 --url=视频地址 或 --bv=BV号，B站视频ID， 两者必须设置一个')
  process.exit(1)
}
if (typeof argv.end !== 'undefined' && argv.end <= 0) {
  console.log('使用 --end=合集个数，必须大于0，单个设置为 1')
  process.exit(1)
}
if (typeof argv.begin !== 'undefined') {
  if (argv.begin < 0 || argv.begin > argv.end) {
    console.log('使用 --begin=第一个编号，必须大于 0 且不大于 end')
    process.exit(1)
  }
}

const videoUrl = argv.bv ? `https://www.bilibili.com/video/${argv.bv}` : argv.url
const lastNumber = parseInt(argv.end || 1)
const firstNumber = parseInt(argv.begin || 1) - 1

const start = async () => {
  console.log(`total count => ${lastNumber - firstNumber}`)
  let i = firstNumber
  while (i++ < lastNumber) {
    const url = `${videoUrl}?p=${i}`
    console.log(`download url => ${url}`)
    const { stdout, stderr } = await exec(`you-get --json ${url}`)
    if (stderr) {
      if (stderr.indexOf('--playlist') == -1) {
        console.error('get info error', stderr)
        continue
      }
    }

    const res = JSON.parse(stdout)
    const match = res.title.match(/(?<=\()(.*)(?=\))/)
    if (match) {
      res.title = match[1]
    }
    res.formatList = Object.keys(res.streams)
      .map(key => {
        const item = res.streams[key]
        item.format = key
        return item
      })
      .sort((a, b) => b.size - a.size)
    delete res.streams

    console.log(`download => ${res.title || url}`)
    const formatItem = res.formatList[0]
    console.log(`format list => ${res.formatList.map(it => it.format).join(' ')}`)
    console.log(`format => ${formatItem.quality}`)

    await download(
      'you-get',
      [
        `--format=${formatItem.format}`,
        `--output-filename=${res.title}`,
        url
      ]
    )
  }
}

function download(cmd, args) {
  return new Promise((resolve, reject) => {
    const cp = spawn(cmd, args, {
      stdio: 'inherit',
    })
    cp.on('close', resolve)
  })
}

start()
