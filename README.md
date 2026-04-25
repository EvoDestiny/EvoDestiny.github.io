# 站点加密说明

本站有一部分项目内容没有直接公开。

在页面上，你仍然可以看到项目入口，比如 `Task 01`，也能看到它当前是 `Sealed` 状态；但项目本身不会直接展示出来。只有在输入正确的 `access token` 之后，对应内容才会被打开。

## 页面上能看到什么

公开页面里保留的是项目入口和加密后的项目文件。

也就是说，访客可以知道这里有某个项目，但看不到它的正文内容，也拿不到用于解封的 `access token`。

## 输入 access token 之后会发生什么

当用户点击项目入口并输入 `access token` 后，浏览器会在本地完成解封，然后用临时页面打开内容。

整个过程都发生在浏览器里，站点本身不会重新放出明文文件，也不会把解开的内容写回公开目录。

## 这不是简单混淆

这里用的不是“把代码改得难读一点”的混淆方式，而是先把项目整体打包，再进行加密。

可以把它理解成一个上了锁的封包：没有 `access token`，就只能拿到封包本身；有了 `access token`，浏览器才能把它打开。

## 技术上是怎么实现的

站点里公开放着两类文件：

- 一个项目清单，用来告诉前端有哪些项目入口
- 一个或多个加密后的项目包，对应每个 task 的实际内容

每个项目在封存时，会先把整个目录打成一个包，再用随机生成的 `vaultKey` 对这个包进行 `AES-GCM` 加密。`access token` 不直接加密正文，而是通过 `Argon2id` 派生出一把包装密钥，用来解开 `vaultKey`。公开文件里保存的是密文、token slot 和解密参数；真正的 `access token` 不会写进公开页面里。

当用户在页面中输入 `access token` 后，浏览器会在本地完成这些步骤：

1. 读取对应的加密包
2. 根据 `access token` 解开对应的 token slot
3. 取回本次 archive 的 `vaultKey`
4. 解开整个项目包
5. 在内存中展开其中的文件
6. 用临时地址把页面打开

如果用户选择绑定设备，浏览器会优先尝试用一个站点级 Passkey PRF 保护本地设备 ticket。第一次成功保存 PRF 时会创建一个系统 Passkey；后续其他 task 会复用同一个 Passkey，只为各自的 `vaultKey` 保存独立的本地 ticket，不再为每个 task 创建新的系统凭证。PRF ticket 是当前设备上的长期授权，不受 5 次或 24 小时限制；如果当前浏览器、认证器或用户授权导致 PRF 不可用，则退到 IndexedDB 中不可导出的 Web Crypto `CryptoKey`。降级 ticket 本身是一段本地密文，会写入 IndexedDB，并以同样的密文在 localStorage 中保留一份镜像；降级方案最多用于 5 次或 24 小时。持久本地存储不可用时，才只保留当前页面会话内的免输入缓存。

Passkey/Windows Security 不会在点击项目或 token 校验成功时自动弹出。点击项目只会打开 token 面板；如果本浏览器保存过 PRF ticket，token 输入框下面会出现 `Use saved Passkey`，只有用户点这个按钮时才会触发系统授权。`Remember this device with Passkey` 默认勾选；输入正确 token 后，只有保持勾选时，页面才会先进入 `Save Passkey` 步骤，并在用户再次点击保存时尝试创建或复用站点级 Passkey。取消或创建失败时才写入 5 次/24 小时的本地降级 ticket。

如果取消勾选 `Remember this device with Passkey`，token 校验和解密会留在当前弹窗里完成，不会创建 Passkey ticket、不会写入 5 次/24 小时的本地降级 ticket，也不会写入 5 次/24 小时的页面会话缓存；如果这个 record 之前已有旧逻辑留下的会话缓存或 PRF 失败留下的本地降级 ticket，这次一次性解锁成功后也会清掉它。自动本地降级解锁只接受带有明确 Remember 标记的新 ticket，旧的无标记降级 ticket 不会再直接通过。完成后页面切到 `Open record` 步骤，用户再点击一次才打开临时 viewer 标签页。这样可以避免解密前先打开空白标签页导致浏览器把原页面降到后台，从而拖慢 Argon2 Worker。

浏览器不能在不调用 WebAuthn 的情况下静默枚举或确认系统里是否仍保存着对应 Passkey。因此如果用户在 Windows 里手动删除了通行凭证，而站点本地 ticket 还在，页面仍可能显示 `Use saved Passkey` 入口；点击后验证会失败，用户需要重新输入 token 来刷新设备授权。

本地测试 Passkey PRF 时，建议使用 `http://localhost:<port>`，不要使用 `http://127.0.0.1:<port>`。Passkey/WebAuthn 的 RP ID 更适合域名 origin；IP origin 不能创建 PRF Passkey，站点会改用 5 次/24 小时的 local fallback；如果持久存储也不可用，才只保留当前会话缓存。

所以，公开站点里保存的是“加密后的项目包”，而不是可以直接访问的项目原文件。

## 这套做法能解决什么

它主要解决的是“公开站点不直接暴露项目内容”这个问题。

没有 `access token` 的情况下，普通访客无法直接读取项目内容；仓库和部署文件里也不会直接放出任务明文。

## 这套做法不能解决什么

如果有人已经拿到了 `access token`，那他就可以正常查看内容。看到之后，仍然可以保存页面、复制内容，或者截图留存。

所以这套机制更接近“访问控制”，而不是“看过也带不走”的那种保护。

