import { FileIcon, FileTextIcon, ImageIcon, VideoIcon, CodeIcon, TableIcon } from "@radix-ui/react-icons"

export function getFileIcon(fileName) {    
  const extension = fileName?.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "pdf":
      return FileTextIcon
    case "csv":
    case "xlsx":
    case "xls":
      return TableIcon
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return ImageIcon
    case "mp4":
    case "avi":
    case "mov":
      return VideoIcon
    case "js":
    case "ts":
    case "html":
    case "css":
      return CodeIcon
    default:
      return FileIcon
  }
}

