// UserController.java
package com.todoapp.controller;

import com.todoapp.Mapper.UserMapper;
import com.todoapp.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        String userId = loginData.get("userId");
        String password = loginData.get("password");

        // 参数验证
        if (userId == null || userId.trim().isEmpty()) {
            response.put("code", 400);
            response.put("message", "用户ID不能为空");
            return response;
        }
        if (password == null || password.isEmpty()) {
            response.put("code", 400);
            response.put("message", "密码不能为空");
            return response;
        }
        if (!password.matches("^[a-zA-Z0-9]{6,18}$")) {
            response.put("code", 400);
            response.put("message", "密码格式不正确（6-18位字母数字）");
            return response;
        }

        User user = userMapper.findByUserId(userId);
        if (user == null) {
            response.put("code", 404);
            response.put("message", "用户不存在");
            return response;
        }
        if (!user.getPassword().equals(password)) {
            response.put("code", 401);
            response.put("message", "密码错误");
            return response;
        }

        response.put("code", 200);
        response.put("message", "登录成功");
        return response;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        // 检查用户是否存在
        User existing = userMapper.findByUserId(user.getUserId());
        if (existing != null) {
            response.put("code", 400);
            response.put("message", "用户已存在");
            return response;
        }

        // 创建用户
        try {
            userMapper.insert(user);
            response.put("code", 200);
            response.put("message", "注册成功");
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "注册失败");
        }
        return response;
    }

    @PostMapping("/updatePassword")
    public Map<String, Object> updatePassword(@RequestBody Map<String, String> data) {
        Map<String, Object> response = new HashMap<>();

        String userId = data.get("userId");
        String oldPassword = data.get("oldPassword");
        String newPassword = data.get("newPassword");

        // 参数校验
        if (userId == null || oldPassword == null || newPassword == null) {
            response.put("code", 400);
            response.put("message", "参数不完整");
            return response;
        }

        // 查询用户
        User user = userMapper.findByUserId(userId);
        if (user == null) {
            response.put("code", 404);
            response.put("message", "用户不存在");
            return response;
        }

        // 验证旧密码
        if (!user.getPassword().equals(oldPassword)) {
            response.put("code", 401);
            response.put("message", "旧密码错误");
            return response;
        }

        // 更新密码
        try {
            int result = userMapper.updatePassword(userId, newPassword);
            if (result > 0) {
                response.put("code", 200);
                response.put("message", "密码更新成功");
            } else {
                response.put("code", 500);
                response.put("message", "密码更新失败");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "服务器异常");
        }

        return response;
    }
}