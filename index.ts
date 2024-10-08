import fs from 'node:fs';
import path from 'node:path'

const getMdPath = () => {
  const relativeMdPath = process.argv[2]
  if (!fs.existsSync(relativeMdPath)) {
    throw new Error('请输入markdown文件路径')
  }
  if (path.extname(relativeMdPath) !== '.md') {
    throw new Error('请输入正确的markdown文件路径，保证文件extname为.md')
  }
  const mdPath = path.resolve(relativeMdPath)
  return { mdPath, mdDirname: path.dirname(mdPath) }
}

const replaceUrl = (content: string, prefix: string = 'images'): { updateContent: string, filePathMap: Map<string, string> } => {
  let idx = 0;
  const regex = /!\[(.*?)\]\((https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg))\)/g
  const filePathSet = new Set<string>()
  const filePathMap = new Map<string, string>()
  const generateFilePath = (fileName: string, prefix: string) => {
    return `./${path.join(prefix)}/${fileName}`
  }
  const updateContent = content.replace(regex, (match, altText, url) => {
    const fileName = url.split('/').pop();  // 获取文件名，例如 "image1.jpg"
    let filePath = generateFilePath(fileName, prefix)
    if (filePathSet.has(filePath)) {
      filePath = generateFilePath(`${idx}-${fileName}`, prefix)
      idx++
    }
    filePathSet.add(filePath)
    filePathMap.set(filePath, url)
    return `![${altText}](${filePath})`;  // 返回新的Markdown图片格式
  })
  const yuQueRegex = /!\[(.*?)\]\((https:\/\/cdn\.nlark\.com\/yuque.*?)(?=\))/g;
  const yuQueUpdateContent = updateContent.replace(yuQueRegex, (match, altText, url) => {
    const fileName = altText;  // 获取文件名，例如 "image1.jpg"
    let filePath = generateFilePath(fileName, prefix)
    if (filePathSet.has(filePath)) {
      filePath = generateFilePath(`${idx}-${fileName}`, prefix)
      idx++
    }
    filePathSet.add(filePath)
    filePathMap.set(filePath, url)
    return `![${altText}](${filePath}`;  // 返回新的Markdown图片格式
  })
  return {
    updateContent: yuQueUpdateContent,
    filePathMap
  }
}

const writeImages = async (filePathMap: Map<string, string>, mdDirname: string) => {
  for (const [localPath, remotePath] of filePathMap) {
    const res = await fetch(remotePath);
    if (!res.ok) {
      console.log(`【下载失败】remote: ${remotePath}, 原因: HTTP error! Status: ${res.status}`);
      break;
    }
    const buffer = await res.arrayBuffer();
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 10));
    const resolveImagePath = path.join(mdDirname, localPath)
    fs.writeFileSync(resolveImagePath, Buffer.from(buffer));
    console.log(`【下载完成】remote: ${remotePath}, localPath: ${resolveImagePath}`)
  }
}

const run = async () => {
  const { mdPath, mdDirname } = getMdPath()
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const prefix = 'images'
  const { updateContent, filePathMap } = replaceUrl(mdContent, prefix)
  const imagesDir = path.join(mdDirname, prefix)
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir)
  }
  fs.writeFileSync(mdPath, updateContent);
  writeImages(filePathMap, mdDirname)
};

run();