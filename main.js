/**
 * 取得選擇的檔案及相關資訊
 *
 * @param {Object} e - DOM
 */
function getImg(e) { 
  showLoading();

  initialization();

  const selectFile = e.files[0]; // 選擇的檔案
  // console.log('檔案來源路徑', e.value);
  // console.log('檔案類型', selectFile.type);
  // console.log('檔案最後修改時間', selectFile.lastModifiedDate);
  
  if (selectFile) {
    let fileReader = new FileReader();
    fileReader.readAsDataURL(selectFile);

    // 取得檔案
    fileReader.onload = () => { 
      // 顯示原始圖片
      document.querySelector('.originalPhoto').src = fileReader.result;

      const imgInstance = new Image();
      imgInstance.src = fileReader.result;
      imgInstance.onload = () => {
        // 原始圖片資訊
        const photoInfo = [{
          name: '檔名',
          value: selectFile.name,
        },{
          name: '檔案大小',
          value: `${selectFile.size} byte`,
        },{
          name: '圖片寬高',
          value: `${imgInstance.width} * ${imgInstance.height}`,
        }];

        addWatermark(imgInstance, photoInfo);
      }
    }
  } else {
    hideLoading();
  }
}


/**
 * 加上浮水印，注意繪製順序，先畫圖片，再來是文字背景區塊，最後才是文字
 * 
 * @param {Object} img - 圖片實例
 * @param {Array} info - 圖片資訊
 */
function addWatermark(img, info) {
  if (!img) {
    hideLoading();
    return;
  }

  const imgWidth = img.width; // 圖片寬度
  const imgHeight = img.height; // 圖片高度

  // 浮水印文字區塊
  let textBlockHeight = imgHeight * 0.3; // 文字區塊高度
  if (imgWidth < imgHeight) { // 直式照片
    textBlockHeight = imgHeight * 0.25;
  }
  const textBlockRowHeight = textBlockHeight / info.length; // 文字區塊每行高度
  const fontSize = (textBlockRowHeight / 1.2) / 1.375; // 文字大小
  const textBlockPaddingX = fontSize; // 文字區塊左右 padding 距離
  const textBlockPaddingY = fontSize; // 文字區塊上下 padding 距離

  // 浮水印文字區塊背景
  const textBackgroundHeight = textBlockHeight + (textBlockPaddingY * 2); // 浮水印文字區塊背景高度

  // 設定畫布
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = imgWidth;
  canvas.height = imgHeight;

  // 繪製原始圖片
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  // 繪製浮水印文字區塊背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 浮水印文字區塊背景色
  ctx.fillRect(0, (imgHeight - textBackgroundHeight), imgWidth, textBackgroundHeight);
  
  // 繪製浮水印文字區塊
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = '#ffffff'; // 文字顏色

  info.forEach((item, i) => {
    const fillStr = measureTextWidth(ctx, imgWidth, `${item.name}：${item.value}`, fontSize);
    // const fillStartHeight = imgHeight - textBackgroundHeight + textBlockPaddingY + (textBlockRowHeight * i);
    const fillStartHeight = imgHeight - textBackgroundHeight + (textBlockPaddingY * 2) + (textBlockRowHeight * i);
    ctx.fillText(fillStr, textBlockPaddingX, fillStartHeight);
  });

  const watermarkImg = canvas.toDataURL();
  document.querySelector('.watermarkImg').src = watermarkImg;
  document.querySelector('.downloadLink').href = watermarkImg;
  document.querySelector('.btnDownload').style.opacity = 1;

  hideLoading();
}


/**
 * 設定顯示文字
 *
 * @param {Object} ctx - 繪圖環境
 * @param {number} imgWidth - 圖片寬度
 * @param {string} text - 文字內容
 * @param {number} fontSize - 字體大小
 * @returns {string} displayText - 要繪製到圖片上的文字內容
 */
function measureTextWidth(ctx, imgWidth, text, fontSize) {
  let displayText = text;
  let textWidth = ctx.measureText(displayText).width;
  let totalWidth = textWidth + (fontSize * 2);
  
  while (totalWidth > imgWidth) {
    displayText = displayText.slice(0, displayText.length - 1);
    textWidth = ctx.measureText(displayText).width;
    totalWidth = textWidth + (fontSize * 2);
  }

  if (displayText !== text) {
    displayText = `${displayText.slice(0, displayText.length - 1)}...`;
  }
  return displayText;
}


/**
 * 清空畫面資料
 */
function initialization() {
  document.querySelector('.originalPhoto').src = '';
  document.querySelector('.watermarkImg').src = '';
  document.querySelector('.btnDownload').style.opacity = 0;
  document.querySelector('.downloadLink').href = '';
}


/**
 * 顯示 loading
 */
function showLoading() {
  document.querySelector('.loading').style.display = 'flex';
}


/**
 * 隱藏 loading
 */
 function hideLoading() {
  document.querySelector('.loading').style.display = 'none';
}
