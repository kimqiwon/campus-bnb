-- ============================================
-- 日常民宿预订管理系统 - 数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS campus_bnb
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_bnb;

-- -------------------------------------------
-- 1. 租客表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS tenant (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL COMMENT 'bcrypt加密',
  real_name  VARCHAR(50)  NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  email      VARCHAR(100),
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 2. 房源表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS room (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL COMMENT '每晚价格',
  room_type   ENUM('single','double','suite') NOT NULL COMMENT '单人间/双人间/套房',
  status      ENUM('available','booked','maintenance') DEFAULT 'available',
  image_url   VARCHAR(255),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 3. 预订表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS booking (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id   INT NOT NULL,
  room_id     INT NOT NULL,
  check_in    DATE NOT NULL COMMENT '入住日期',
  check_out   DATE NOT NULL COMMENT '退房日期',
  nights      INT NOT NULL COMMENT '入住天数',
  total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
  status      ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id)   REFERENCES room(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 4. 结算表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS settlement (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  booking_id     INT NOT NULL UNIQUE,
  amount         DECIMAL(10,2) NOT NULL COMMENT '结算金额',
  payment_status ENUM('unpaid','paid') DEFAULT 'unpaid',
  settled_at     DATETIME COMMENT '结算时间',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 5. 测试数据
-- -------------------------------------------
INSERT INTO tenant (username, password, real_name, phone, email) VALUES
('admin', '$2b$10$d1qPz1KsT0Ss5XVF5jOVHuxuB5HFi8KTw0w1L5GzgD1QvLpZf3gRS', '管理员', '13800000000', 'admin@bnb.com'),
('zhangsan', '$2b$10$d1qPz1KsT0Ss5XVF5jOVHuxuB5HFi8KTw0w1L5GzgD1QvLpZf3gRS', '张三', '13800000001', 'zhangsan@qq.com'),
('lisi', '$2b$10$d1qPz1KsT0Ss5XVF5jOVHuxuB5HFi8KTw0w1L5GzgD1QvLpZf3gRS', '李四', '13800000002', 'lisi@qq.com');
-- 密码均为: 123456

INSERT INTO room (title, description, price, room_type, status, image_url) VALUES
('山水大床房', '朝南带阳台，可看山景，独立卫浴', 288.00, 'single', 'available', 'https://picsum.photos/400/300?random=1'),
('温馨双床房', '适合朋友同行，两张1.5m床', 388.00, 'double', 'available', 'https://picsum.photos/400/300?random=2'),
('豪华套房', '独立客厅+卧室，带浴缸', 688.00, 'suite', 'available', 'https://picsum.photos/400/300?random=3'),
('庭院景观房', '一楼带小院，适合长租', 328.00, 'single', 'maintenance', 'https://picsum.photos/400/300?random=4');

INSERT INTO booking (tenant_id, room_id, check_in, check_out, nights, total_price, status) VALUES
(2, 1, '2026-06-01', '2026-06-03', 2, 576.00, 'completed'),
(3, 2, '2026-06-10', '2026-06-12', 2, 776.00, 'confirmed');

INSERT INTO settlement (booking_id, amount, payment_status, settled_at) VALUES
(1, 576.00, 'paid', '2026-05-20 10:00:00'),
(2, 776.00, 'unpaid', NULL);
