启动项目：
npm i
npm start

加载页面之后，点击加载数据或左侧的按钮， 加载./pdb-files 中的文件

题目1: 
实现 zoomIn/zoomOut
要在 apps/mos-frontend/src/molstar/useHandleZoom.ts 这个文件中实现
目标：最后效果等同 滚轮在3D视图区域滚动时放大缩小的效果

题目2:
实现 setDistance
要在 apps/mos-frontend/src/molstar/useSetDistance.ts 这个文件中实现
目标：点击按钮，计算选中的两个氨基酸之间的距离，等同于molstar中测量距离的功能。

题目3:
实现changeColor
要在 apps/mos-frontend/src/molstar/useHandleChangeColor.ts 这个文件中实现
目标：点击按钮，选中的所有氨基酸随机改变颜色为 ColorMap 中的颜色


备注：
1. 使用的渲染蛋白质的底层库是 https://github.com/molstar/molstar，需要自行启动这个项目，找到相关api进行开发。

