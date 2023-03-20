const mineflayer = require('mineflayer') 
const config = require('./settings.json');
const { version } = require('os')
const repl = require("repl")
const readline = require('readline');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
const minecraftData = require('minecraft-data')('1.19.3');
const autoeat = require('mineflayer-auto-eat').plugin;
const vec3 = require('vec3')
const delay = require('util').promisify(setTimeout)
const Movements = require('mineflayer-pathfinder').Movements;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { GoalNear, GoalBlock, GoalFollow, GoalBreakBlock, GoalXZ } = require('mineflayer-pathfinder').goals;
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')


//配置Bot参数
function createBot() {
  const bot = mineflayer.createBot({
    /*
    username: config['bot-account']['username'],
    password: config['bot-account']['password'],
    auth: config['bot-account']['type'],
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version,
    */
    host:'*',
    username:'*',
    password:'*',
    version:'1.19.3',
    auth:'microsoft'
 });

  bot.loadPlugin(pathfinder);
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.settings.colorsEnabled = false;
  bot.pathfinder.setMovements(defaultMove);

  const pos = config.position;
 // 如果位置模块被启用，将会执行下面的代码
  if (config.position.enabled) {
    console.log(
         `开始移动到目标位置(${pos.x}, ${pos.y}, ${pos.z})`
     );
     // 设置bot的路径规划目标为指定的位置
     bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
  }
  bot.on('goal_reached', () => {
    if(config.position.enabled) {
      console.log(
           `达到目标位置：${bot.entity.position}`
       );
    }
 });
 // 如果anti-afk模块被启用，将会执行下面的代码
  if (config.utils['anti-afk'].enabled) {
     if (config.utils['anti-afk'].sneak) {
        // 如果sneak选项被启用，则bot将保持潜行状态
        bot.setControlState('sneak', true);
     }
     
     // 如果jump选项被启用，则bot将保持跳跃状态
     if (config.utils['anti-afk'].jump) {
        bot.setControlState('jump', true);
     }

     // 如果hit选项被启用，则bot将以指定的时间间隔攻击敌人或挥动武器
     if (config.utils['anti-afk']['hit'].enabled) {
        let delay = config.utils['anti-afk']['hit']['delay'];
        let attackMobs = config.utils['anti-afk']['hit']['attack-mobs']

        setInterval(() => {
           if(attackMobs) {
                 let entity = bot.nearestEntity(e => e.type !== 'object' && e.type !== 'player'
                     && e.type !== 'global' && e.type !== 'orb' && e.type !== 'other');

                 if(entity) {
                    bot.attack(entity);
                    return
                 }
           }

           bot.swingArm("right", true);
        }, delay);
     }

     if (config.utils['anti-afk'].rotate) {
        setInterval(() => {
           bot.look(bot.entity.yaw + 1, bot.entity.pitch, true);
        }, 100);
     }

     if (config.utils['anti-afk']['circle-walk'].enabled) {
        let radius = config.utils['anti-afk']['circle-walk']['radius']
        circleWalk(bot, radius);
     }
  }

  // 连接成功时打印消息
  /*
  bot.once('login', () => {
    bot.chat('Hello Wooooooorld!');
  });
  */
  bot.on('login', () => {
    console.log('已成功连接');
  });

  // 记录错误和被踢出服务器的原因:
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  // 断开连接时打印消息
  bot.on('chat', async (username, message)  => {
    if (message === '09该歇了') {
      bot.chat('好 摸了');
      console.log('歇');
      bot.quit();
    }
  });

  if (config.utils['auto-reconnect']) {
      bot.on('end', () => {
         setTimeout(() => {
            createBot();
         }, config.utils['auto-reconnect-delay']);
      });
   }

/*
  // 看看bot在做什么
  bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port 是本地网页运行的端口 ，如果 firstPerson: false，那么将会显示鸟瞰图。
  })
*/

  //聊天信息后台显示
  bot.on('message', (message) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    console.log(`[${timeStr}] ${message.toAnsi()}`);
  });

  // 创建一个readline接口，以便从命令行读取输入
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  //聊天和命令输入
  rl.on('line', (input) => {
        bot.chat(input);
    });

  // 在聊天中发送消息
    function sendChatMessage(msg) {
      bot.chat(msg);
    }

  //抄了一下天网的面板
    bot.on("chat", async (username, message) => {

      //if (username === bot.username) return;
      /*
      if (/^zzz/.test(message)) {
        bot.chat("睡了哦");
      } */

      if (/^猫猫/.test(message)) {
          bot.chat("哪里有猫猫！");
      }

      if (/^bot#help$/.test(message)) {
          var helpMsg = `bot#[CMD] - 执行命令[CMD]
          bot#help - 显示帮助
          bot#exit - 退出
          bot#stats - 状态
          bot#tp2Me - 将 bot 传送到自己
          bot#tp2Bot - 将自己传送到 bot
          bot#inv - 显示 bot 的背包
          bot#toss [ITEM] - 丢弃物品[ITEM]
          bot#toss [AMOUNT] [ITEM] - 丢弃物品[ITEM] [AMOUNT] 个
          zzz - 找床
          forward - 机器人向前移动
          back - 机器人向后移动
          left - 机器人向左移动
          right - 机器人向右移动
          sprint - 机器人开始奔跑
          stop - 停止机器人的移动
          jump - 机器人跳跃一次
          jump a lot - 机器人不停地跳跃
          stop jumping - 停止机器人跳跃
          attack - 机器人攻击附近的实体
          mount - 机器人骑上附近的物体（如矿车）
          dismount - 机器人下车
          move vehicle forward - 控制机器人骑乘的交通工具向前移动
          move vehicle backward - 控制机器人骑乘的交通工具向后移动
          move vehicle left - 控制机器人骑乘的交通工具向左移动
          move vehicle right - 控制机器人骑乘的交通工具向右移动
          tp - 机器人向上传送10个方块
          pos - 机器人将自己的位置发送到聊天中
          yp - 机器人将自己的偏航和俯仰发送到聊天中`;
          bot.whisper(username, helpMsg);
      }

      if (/^bot#stats$/.test(message)) {
        bot.chat(botStats());
      }

      if (/^bot#exit$/.test(message)) {
        bot.chat('呜呜 走了啦');
        bot.quit();
      }

      if (/^bot#tp2Me$/.test(message)) {
          bot.chat("/tpa " + username);
      }

      if (/^bot#tp2Bot$/.test(message)) {
          bot.chat("/tpahere " + username);
      }
      const InventoryCommand = message.split(" ");
      if (/^bot#inv$/.test(message)) {
          sayItems();
      }

      if (/^bot#toss \d+ \w+$/.test(message)) {
          // toss amount name
          // ex: toss 64 diamond
          tossItem(InventoryCommand[2], InventoryCommand[1]);
      }

      if (/^bot#toss \w+$/.test(message)) {
          // toss name
          // ex: toss diamond
          tossItem(InventoryCommand[1]);
      }
  });

  //丢弃物品
  function sayItems(items = null) {
    if (!items) {
      // 如果没有指定要列出的物品，那么就默认列出 bot 的整个背包
      items = bot.inventory.items();
      // 如果是1.9版本或以上，并且装备栏的下方有装备，则把这些装备也添加到列表中
      if (
        require("minecraft-data")(bot.version).isNewerOrEqualTo("1.9") &&
        bot.inventory.slots[45]
      ) {
        items.push(bot.inventory.slots[45]);
      }
    }
    // 把物品列表转换为字符串
    const output = items.map(itemToString).join(", ");
    if (output) {
      // 把转换后的字符串发送到聊天窗口
      bot.chat(output);
    } else {
      bot.chat("被扒干净了呜呜");
    }
  }

  function tossItem(name, amount) {
    amount = parseInt(amount, 10);
    const item = itemByName(name);
    if (!item) {
      // 如果没有这个物品，则发送错误消息
      bot.chat(`没有 ${name}`);
    } else if (amount) {
      // 如果指定了要丢弃的数量，则把指定数量的物品扔掉
      bot.tossStack(item.type, null, amount, checkIfTossed.bind(null, name, amount));
    } else {
      // 否则，只丢弃一个物品
      bot.tossStack(item, checkIfTossed.bind(null, name, 1));
    }
  }

  function checkIfTossed(name, amount, err) {
    if (err) {
      // 如果出错了，则发送错误消息
      bot.chat(`无法丢弃： ${err.message}`);
    } else if (amount) {
      // 如果指定了要丢弃的数量，则发送成功消息，并把数量也输出出来
      bot.chat(`丢了 ${amount} 个 ${name}`);
    } else {
      // 否则，只发送成功消息
      bot.chat(`丢了 ${name}`);
    }
  }

  function itemToString(item) {
    if (item) {
      // 把物品的名称和数量组合成字符串
      return `${item.name} x ${item.count}`;
    } else {
      // 如果物品为空，则返回一个特定字符串
      return "(nothing)";
    }
  }

  function itemByName(name) {
    const items = bot.inventory.items();
    if (
      require("minecraft-data")(bot.version).isNewerOrEqualTo("1.9") &&
      bot.inventory.slots[45]
    ) {
      items.push(bot.inventory.slots[45]);
    }
    // 在背包中寻找指定名称的物品
    return items.find((item) => item.name === name);
  }


  //状态
    function botStats() {
    var stats = `生命值：${bot.health}    饥饿度：${bot.food}    等级：${bot.experience.level}    坐标：${bot.entity.position}    维度：${bot.game.dimension}\n`;
    var playerList = Object.keys(bot.players);
    for (var i = playerList.length - 1; i >= 0; i--) {
        if (playerList[i][0] === "~") {
            playerList.splice(i, 1);
        }
    }
    stats += `玩家人数：${playerList.length}    玩家列表：${playerList}`;
    return stats;
    };


  //死亡通报
  bot.on("death", () => {
      bot.chat("呜呜呜，死了啦！");
  });

  // 监听天气变化事件
    bot.on('rain', () => {
      console.log('下雨了');
    });
    
    bot.on('rainStop', () => {
      console.log('雨停了');
    });
    
    bot.on('thunder', () => {
      console.log('Thunder started.');
      // 当监测到雷暴天气时，发送消息到聊天
      bot.chat('我超，打雷了，有人睡觉吗——');
    });
    

  bot.on('kicked', (reason) => {
      let reasonText = JSON.parse(reason).text;
      if(reasonText === '') {
        reasonText = JSON.parse(reason).extra[0].text
      }
      reasonText = reasonText.replace(/§./g, '');

      console.log(`Bot was kicked from the server. Reason: ${reasonText}`)
  }
  );

  bot.on('error', (err) =>
    console.log(`${err.message}`)
  );

  // 监听喵喵刷新事件
  bot.on('entitySpawn', (entity) => {
      
      if (entity.type === 'mob' && entity.name === 'Cat') {
        console.log(`猫猫位置: ${entity.position}`);
        
        bot.chat(`喵↑喵↓ 在: ${entity.position.x}, ${entity.position.y}, ${entity.position.z}！冲！`);
      }
    });


  //自动吃东西
  bot.loadPlugin(autoeat);
  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 16,
    bannedBlocks: [],
    eatWhenInventoryNotFull: true,
    blocksToAvoid: [],
  };

  bot.autoEat.enable();

  /*
  //钓鱼4-oncollect
  // 加载路径规划插件
  bot.loadPlugin(pathfinder)
  // 初始化钓鱼状态
  let nowFishing = false

  // 机器人第一次生成时触发的事件，输出 Ready
  bot.once('spawn', () => {
    console.log('Ready')
  })

  // 监听聊天消息事件，判断是否开始/结束钓鱼
  bot.on('chat', (username, message) => {
    if (bot.entity.username === username) {
    if (message === 'start fishing') {
      startFishing()
    }
    if (message === 'stop fishing') {
      stopFishing()
    }
  }})


  // 玩家收集物品时触发的事件
  function onCollect(player, entity) {
    console.log(entity)
    // 如果捕获的是鱼，则停止监听该事件，并继续钓鱼
    if (entity.metadata[8] && player === bot.entity) {
      bot.removeListener('playerCollect', onCollect)
      fishs()
    }
  }


  async function fishs() {
    try {
      // 装备钓竿
      await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    } catch (err) {
      return bot.chat(err.message)
    }

    // 设置正在钓鱼的状态
    nowFishing = true

    // 当玩家收集到钓到的物品时，调用 onCollect 函数
    bot.on('playerCollect', onCollect)

    try {
      // 开始钓鱼
      await bot.fish()
    } catch (err) {
      bot.chat(err.message)
    }

    // 钓鱼结束，将正在钓鱼的状态改为 false
    nowFishing = false
  }


  // 检查是否需要清空背包
  async function itemsDrop() {
    const freeSlots = bot.inventory.emptySlotCount()
    if (freeSlots === 0) {
      bot.chat('背包满了，丢')
      bot.look(bot.entity.yaw + 180, 0) // 转头
      const itemsToDrop = bot.inventory.items().filter(item => {
        return item.name === 'fishing_rod' && item.nbt.displayName === '1' ||
              item.name === 'pumpkin_pie'
      })
      for (const item of itemsToDrop) {
        await bot.tossStack(item)
      }
      bot.look(bot.entity.yaw - 180, 0) // 转回头
    }
  }

  async function startFishing() {
    // 创建默认的移动方式
    const defaultMove = new Movements(bot, minecraftData)
    defaultMove.allow1by1towers = true
    
    // 查找距离机器人最近的水源方块
    const water = bot.findBlocks({
      matching: minecraftData.blocksByName.water.id, // 匹配水源方块
      maxDistance: 10, // 最大搜索距离
      count: 1 // 找到的数量
    })

    // 如果没有找到水源方块，返回并发送聊天消息
    if (!water) {
      bot.chat("没水钓鱼 你钓谁啊")
      return
    }

    // 找到水源方块和水面方块
    const w = bot.blockAt(water[0])
    const v = bot.blockAt(w.position.offset(0, 1, 0))

    // 设置机器人的移动方式和目标
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(w.position.x, w.position.y, w.position.z, 3))
    
    // 发送聊天消息和日志信息
    bot.chat('别急 在找水了')
    console.log('Fishing - Looking for water..')

    // 监听机器人到达目标后的事件，开始钓鱼
    bot.once('goal_reached', async () => {
        // 设置bot面向水源
      const waterPos = bot.findBlock({
        matching: minecraftData.blocksByName.lily_pad.id,
        maxDistance: 3
        });
      if (waterPos) {
        bot.lookAt(waterPos.position.offset(0.5, 0.5, 0.5));
      } 

      console.log('I started fishing.')
      try {
        await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
      } catch (err) {
        return bot.chat(err.message)
      }

      nowFishing = true
      bot.on('playerCollect', onCollect)

      try {
        await bot.fish()
      } catch (err) {
        bot.chat(err.message)
      }
      nowFishing = false
    })

  }

  function stopFishing() {
    // 移除钓鱼事件监听器
    bot.removeListener('playerCollect', onCollect)

    // 如果机器人正在钓鱼，停止钓鱼
    if (nowFishing) {
      bot.activateItem()
    }
  }
  */

  
  //自动钓鱼 钓鱼5-from kahu-09增加了很多不必要的过程（
  let fishCount = 0;
  let fishing = false;
  
  bot.chatAddPattern(/startfishing/i, 'startfishing');
  bot.chatAddPattern(/stopfishing/i, 'stopfishing');
  
  bot.on('startfishing', () => {
    console.log('fishing start');
    fishing = true;
    fishLoop();
  });
  
  bot.on('stopfishing', () => {
    console.log('fishing stopped');
    fishing = false;
  });
  
  async function fishLoop() {
    while (fishing) {
      await bot.fish();
      await delay(2000); // 等待2秒钟
      fishCount++;
    }
  }
  
  //统计
  bot.chatAddPattern(
    /(摸鱼进度)/,
    'fishcount'
  )
  const fc = () =>{
    bot.chat('目前摸到了'+fishCount+'条鱼')
  }
  bot.on('fishcount',fc)


  // 获取游戏时间
  function getGameTime() {
    const timeOfDay = bot.time.timeOfDay;
    let hours = Math.floor((timeOfDay / 1000) + 6);
    if (hours >= 24) {
      hours -= 24;
    }
    const minutes = Math.floor((timeOfDay % 1000) / 1000 * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
   
  
  bot.on('chat', (username, message) => {
    if (message === '现在几点了') {
      const gameTime = getGameTime(); 
      const realTime = new Date().toLocaleTimeString();
      bot.chat(`游戏内时间是 ${gameTime}，现实世界时间是 ${realTime}`);
    }
  });
  
  

  // 找不到的床

  bot.loadPlugin(pathfinder);

  bot.on('spawn', () => {
    const defaultMove = new Movements(bot, mcData);

    function isNight() {
      const timeOfDay = bot.time.timeOfDay;
      return timeOfDay >= 12542 && timeOfDay <= 23460;
    }

    bot.on('chat', (username, message) => {
      if (message === 'zzz' && isNight()) {
        if (fishing) {
          bot.chat('/stopFishing');
          bot.once('stopfishing', () => {
            goToSleep();
          });
        } else {
          goToSleep();
        }
      } else if (message === 'zzz') {
        bot.chat('现在还是白天诶！');
      }
    });
    

    bot.on('sleep', () => {
      if (!isNight()) {
        bot.chat('起床了！');
        wakeUp();
      }
    });
    
    function goToSleep() {
      const bed = bot.findBlock({
        matching: block => bot.isABed(block),
        maxDistance: 4
      });
      
      if (!bed) {
        bot.chat('没床睡什么啦（爆筋）');
        return;
      }
    
      const mcData = require('minecraft-data')(bot.version);
      const defaultMove = new Movements(bot, mcData);
      
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalNear(bed.position.x, bed.position.y, bed.position.z, 3));
    
      bot.once('goal_reached', async () => {
        await bot.lookAt(bed.position.offset(0.5, 0.5, 0.5));
        console.log('准备睡觉');
    
        try {
          await bot.sleep(bed);
          bot.chat('躺！');
        } catch (err) {
          bot.chat(`呜呜 睡不了了: ${err.message}`);
          console.log(`无法睡觉: ${err}`);
        }
      });
    };

    function wakeUp () {
        bot.wake((err) => {
          if (err) {
            bot.chat(`赖床！: ${err.message}`)
            console.log(`无法起床: ${err}`);
          } else {
            bot.chat('早')
          }
        })
    }
    
    // 设置bot面向荷叶
    bot.on('chat', (username, message) => {
      if (message === '醒了吗') {
        lilypad ()
      }
    });

    function lilypad () {
    const waterPos = bot.findBlock({
      matching: minecraftData.blocksByName.lily_pad.id,
      maxDistance: 20
      });
    if (waterPos) {
      bot.lookAt(waterPos.position.offset(0.5, 0.5, 0.5));
      bot.chat('醒了...');
      console.log('好 我看到荷叶了')
    } else if(!waterPos){
       bot.chat('这床好烂 呜呜');
       console.log('快让他home')
    }
    }
    });


    // Moving
    let Moving = false;

    function startMoving() {
      Moving = true;
    }
    
    function stopMoving() {
      Moving = false;
    }
    
    bot.on('chat', (username, message) => {
      if (message === 'open moving mode') {
        startMoving();
      } else if (message === 'close moving mode') {
        stopMoving();
      }
    });
    
    bot.on('physicTick', () => {
      if (Moving) {
        // 移动的代码
        let target = null // 目标实体

        // 监听聊天事件
        bot.on('chat', (username, message) => {
          if (username === bot.username) return // 忽略机器人自己发的消息
          /*
          target = bot.players[username].entity // 目标实体更新为发送者的实体
          */
          // 如果发消息的人在游戏里，就把target变成发消息的人，如果不在游戏里，就选取离bot最近的人
          if (bot.players[username]) {
            target = bot.players[username].entity
          } else {
            let nearestPlayer = null
            let nearestDistance = Number.MAX_VALUE
            for (let playerName in bot.players) {
              const player = bot.players[playerName]
              if (player && player.entity && player.entity.position && player.username !== bot.username) {
                const distance = player.entity.position.distanceTo(bot.entity.position)            
                if (distance < nearestDistance) {
                  nearestPlayer = player.entity
                  nearestDistance = distance
                }
              }
            }
            target = nearestPlayer
          }
          
          let entity
          switch (message) {
            case 'forward':
              bot.setControlState('forward', true) // 设置向前移动状态
              break
            case 'back':
              bot.setControlState('back', true) // 设置向后移动状态
              break
            case 'left':
              bot.setControlState('left', true) // 设置向左移动状态
              break
            case 'right':
              bot.setControlState('right', true) // 设置向右移动状态
              break
            case 'sprint':
              bot.setControlState('sprint', true) // 设置奔跑状态
              break
            case 'stop':
              bot.clearControlStates() // 清除所有移动状态
              break
            case 'jump':
              bot.setControlState('jump', true) // 设置跳跃状态为 true
              bot.setControlState('jump', false) // 设置跳跃状态为 false，即跳跃一次
              break
            case 'jump a lot':
              bot.setControlState('jump', true) // 设置跳跃状态为 true，持续跳跃
              break
            case 'stop jumping':
              bot.setControlState('jump', false) // 停止跳跃
              break
            case 'attack':
              entity = bot.nearestEntity() // 获取最近的实体
              if (entity) {
                bot.attack(entity, true) // 攻击最近的实体
              } else {
                bot.chat('附近没东西 打个卵子') // 没有实体时提示消息
              }
              break
            case 'mount':
              entity = bot.nearestEntity((entity) => { return entity.name === 'minecart' }) // 获取最近的矿车
              if (entity) {
                bot.mount(entity);
                bot.chat('上 矿 车') // 骑乘最近的矿车
              } else {
                bot.chat('没车 呃呃') // 没有矿车时提示
              }
              break
            case 'dismount': // 下矿车
              bot.dismount()
              break
            case 'move vehicle forward': // 控制当前的载具向前
              bot.moveVehicle(0.0, 1.0)
              break
            case 'move vehicle backward': // 控制当前的载具向后
              bot.moveVehicle(0.0, -1.0)
              break
            case 'move vehicle left': // 控制当前的载具向左
              bot.moveVehicle(1.0, 0.0)
              break
            case 'move vehicle right': // 控制当前的载具向右
              bot.moveVehicle(-1.0, 0.0)
              break
            case 'tp':
              bot.entity.position.y += 10
              break
            case 'pos':
              bot.chat(bot.entity.position.toString())
              break
            case 'yp':
              bot.chat(`偏航角: ${bot.entity.yaw}, 俯视角: ${bot.entity.pitch}`) // 输出当前的偏航角度和俯仰角度
              break
          }
        })

        bot.once('spawn', () => {
          // keep your eyes on the target, so creepy!
          setInterval(watchTarget, 50) // 每 50 毫秒会执行一次

          function watchTarget () {
            if (!target) return
            bot.lookAt(target.position.offset(0, target.height, 0)) // 目标的位置加上目标的高度
          }
        })

        bot.on('mount', () => {
          bot.chat(`上 ${bot.vehicle.objectType}了`)
        })

        bot.on('dismount', (vehicle) => {
          bot.chat(`下 ${bot.vehicle.objectType}了`)
        })

       }
    });
    
  
}

createBot();
