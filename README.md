# Bubble
葡萄后台开发框架,基于angularjs,bootstrap开发

# Build
npm run build

# Install
npm install

# Start
npm start
The app will be hosted at http://localhost:3000

# directory
![目录结构](http://106.14.199.22/directory.png)

# 页面组成
框架由路由驱动
页面由 模板 | 控制器 | 样式组成

# 路由配置
```javascript
配置于public/js/bubble/routerConfig.js
获取一级路由
bubbleFrame.router()

设置多级路由,支持链式操作,详见routerConfig.js
```
# 配置demo
```javascript
parent.add(demo(路由名称), 控制器, 依赖, 模板);
parent = router.setParent(demo, demoFile);  新增子路由demo,文件夹名称为demoFile
parent.add("wechat");                       demo子路由新增wechat路由
parent.add("demo1")();                       demo子路由新增demo1路由
parent.add("demo2","123")("123");                       demo子路由新增demo1路由

wechat页面文件存于
public/js/controller/demoFile/wecahtController.js
public/tpl/demoFile/wecaht.html

demo1页面文件则存于
public/js/controller/demoFile/demo1Controller.js
public/tpl/demoFile/demo1.html
public/style/demoFile/demo1.css

demo2页面文件则存于
public/js/controller/demoFile/123Controller.js
public/tpl/demoFile/demo2.html
public/style/demoFile/123.css
```
# 页面配置方法
parent.add(路由名称,控制器名称(若不填写则使用路由名称,null表示无控制器), [依赖项,详见public/js/bubble/lazyloadConfig.js])(页面子样式,若未填写名称则使用路由名称,框架会到style中寻找样式文件);
