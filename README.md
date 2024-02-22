# setup

```bash
git clone https://github.com/sebastos1/app
cd app
nix develop
# adb devices (make sure android phone/vm connected)
# npm install (if flake didnt want to)
npm start
```

# if wsl
on windows:
```bash
adb tcpip 5555
```
on wsl:
```bash
adb connect <device-ip>:5555
```
