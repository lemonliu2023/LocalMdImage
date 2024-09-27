import fs from 'node:fs';
import path from 'node:path'

const getMdPath = () => {
  const mdPath = process.argv[2]
  if(!fs.existsSync(mdPath)) {
    throw new Error('请输入markdown文件路径')
  }
  if(path.extname(mdPath) !== '.md') {
    throw new Error('请输入正确的markdown文件路径，保证文件extname为.md')
  }
  return path.resolve(process.argv[2])
}

const replaceUrlAndReturnAlt = (mdContent: string) => {
}
const run = async () => {
  const mdPath = getMdPath()
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const altList = replaceUrlAndReturnAlt(mdContent)
  // const res = await fetch('https://p.ipic.vip/56e1l1.png');
  // if (!res.ok) {
  //   throw new Error(`HTTP error! Status: ${res.status}`);
  // }
  // const buffer = await res.arrayBuffer();
  // fs.writeFileSync('./image.png', Buffer.from(buffer));
};

run();