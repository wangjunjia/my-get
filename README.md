# my-get

使用 `you-get` 批量下载视频时，会发现有些视频的质量不是最高的，是因为高质量的不是 mp4 或者不是默认下载质量，这里改善了一下，每次下载之前获取一下对应视频的质量列表，按照质量大小从高到低排序，取第一个高质量的下载，当然有些下载下来的格式不是 mp4 格式的，可能是 flv 等，需要使用 `vlc` 等工具播放。

```
$ my-get -v

my-get <1.0.0> 使用 you-get 下载最高质量视频

usage: my-get [options] args
options:
  --debug: 调试模式
  -h, --help: 打印帮助
  -v, --version: 输出版本

args:
  --url: 视频地址
  --bv: B站bv号，和 url 二者取一
  --end: 总数量或者最后一个
  --begin: 自定义第一个，（可选，默认从第一个开始）
```

> -h, --help, -v, --version 偷懒一下，都是输出帮助信息

`--debug` 输出解析后的命令行参数
```
$ my-get -url=xxxx --debug

my-get <1.0.0> 使用 you-get 下载最高质量视频

[debug]:
{ _: [], u: true, r: true, l: 'xxxx', debug: true }

使用 --url=视频地址 或 --bv=BV号，B站视频ID， 两者必须设置一个
```

最后：当然需要你本地安装 `you-get` 工具了～