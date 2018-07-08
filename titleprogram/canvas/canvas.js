
// pls don't code like this in production env, it is too hard to read.
Page({
  data: {
    showWidth: app.globalData.windowWidth,
    showHeight: null,
    saveWidth: 800,
    saveHeight: null,
    opentype:null,
    tmpPath:null,
    picPath:"https://img3.doubanio.com/view/photo/l/public/p2327709524.jpg",
    localPath:null,
    comment:null,
    commentList:null,
    title:""
  },

  onLoad: function (options) {
    this.setData({
      picPath:options.pic,
      comment:options.comment,
      commentList: util.canvasWorkBreak(this.data.showWidth - 60,16,options.comment),
      title:options.title
    })
    this.createNewImg(2);
    return;
  },

  onShow: function(options) {
    console.log("on Show")
    this.setData({
      opentype:""
    })
  },

  createNewImg: function (lineNum) {
    let that = this;
    let ctx = wx.createCanvasContext('shareCanvas');
    let fontSize = 16
    let fontOffset = 30
    let qrcodeSize = 50
    let lineHeight = 20
    var fontHeight = (that.data.commentList.length + 1) * fontOffset 
    wx.getImageInfo({
      src: that.data.picPath,
      success: function (res) {
        var ratio = res.width / (that.data.showWidth);
        var imgHeight = parseInt(res.height / ratio)
        that.setData({
          showHeight: imgHeight / 1.5 + fontHeight + lineHeight*2 +qrcodeSize + fontOffset,
          localPath:res.path
        })

        ctx.drawImage(that.data.localPath, 0, 0, that.data.showWidth, imgHeight)

        //cover the rest of the image if the image is too long
        ctx.rect(0, imgHeight/1.5, that.data.showWidth, imgHeight);
        ctx.setFillStyle("white");
        ctx.fill()
        
        // write the string
        var height = imgHeight / 1.5 + fontOffset
        for (let item of that.data.commentList) {
          if (item !== 'a') {
            ctx.setFontSize(fontSize);
            ctx.setFillStyle("#484a3d");
            ctx.fillText(item, fontOffset, height);
            height += fontOffset;
          }
        }
        var title = "--『".concat(that.data.title,"』观后");
        var titleOffset = that.data.showWidth - fontOffset - title.length*fontSize
      
        ctx.fillText(title, titleOffset, imgHeight / 1.5 + fontHeight);

        //draw a line
        ctx.beginPath();
        ctx.setLineWidth(0.1)
        ctx.moveTo(that.data.showWidth / 2 - fontOffset, imgHeight / 1.5 + fontHeight + lineHeight);
        ctx.lineTo(that.data.showWidth / 2 + fontOffset, imgHeight / 1.5 + fontHeight + lineHeight);
        ctx.stroke('#eee');
        ctx.closePath();

        //draw qrcode
        ctx.drawImage('../../elements/img/qrcode.jpg', that.data.showWidth / 2 - 25, imgHeight / 1.5 + fontHeight + lineHeight*2, 50, 50);

        ctx.draw(true, setTimeout(function () {
          wx.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            success: function (res) {
              console.log(res.tempFilePath)
              that.data.tmpPath = res.tempFilePath
            },
          })
        }, 1000)
        );
      }
    })
  },


  savePic: function () {
    let that = this;

    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: function (res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          fail: function (res) {
            console.log(res)
            wx.getSetting({
              success: function (res) {
                console.log(res.authSetting)
                if (("scope.writePhotosAlbum" in res.authSetting) && !res.authSetting['scope.writePhotosAlbum']) {
                  console.log("auth fail")
                  that.setData({
                    opentype: "openSetting"
                  })
                }
              }
            })
          }
        })
        // that.data.tmpPath = res.tempFilePath
      },
    })

    
  },


})
