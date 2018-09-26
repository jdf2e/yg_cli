在客户端，emit`clientEvent`给服务端，传送参数为一个protocolmodel对象

在服务端接收到`clientEvent`后，分发给各条子命令处理，各个子handler返回标识告诉分发器（clientEvent的回调函数）是否被截获。若都没有被截获，则报错，并断开连接

服务端处理完对应命令后，构造protocolmodel对象，并emit相应的`eventconsts`事件

* 模板结构
* 编译器结构
* ygconfig结构
* 通信结构
* 同步功能（困难），传输过程中中断处理，阻塞处理等
* 如果服务端没有uuid，而本地却有，那么用这个uuid创建服务端的文件夹
