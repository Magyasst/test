// PersonController.java
package com.todoapp.controller;

import com.todoapp.Mapper.PersonMapper;
import com.todoapp.pojo.Person;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PersonController {

    @Autowired
    private PersonMapper personMapper;

    @PostMapping("/person")//网页端接口
    public Integer createTask(@RequestBody Person person) {
        return personMapper.insertOne(person);
    }

    @GetMapping("/person/{id}")
    public Person getTaskById(@PathVariable Integer id) {
        return personMapper.selectById(id);
    }

    @PutMapping("/person/{id}")
    public Integer updateTask(@PathVariable Integer id, @RequestBody Person person) {
        person.setId(id);
        return personMapper.updateById(person);
    }

    @DeleteMapping("/person/{id}")
    public Integer deleteTask(@PathVariable Integer id) {
        return personMapper.deleteById(id);
    }

    @GetMapping("/person")
    public List<Person> getAllTasks() {
        return personMapper.queryALL();
    }

    @GetMapping("/person/search")
    public List<Person> searchTasks(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category) {

        System.out.println("Search request received - userId: " + userId
                + ", title: " + title
                + ", category: " + category);

        return personMapper.searchByConditions(userId, title, category);
    }
//更新状态
    @PutMapping("/person/status/{id}")
    public Integer updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> requestBody) {
        return personMapper.updateStatus(id, requestBody.get("status"));
    }

    @GetMapping("/person/stats")//通用
    public List<CategoryStat> getStats(
            @RequestParam String userId,
            @RequestParam String range) {
        return personMapper.getCategoryStats(userId, range);
    }

    // 小程序创建任务
    @PostMapping("/person/v2")
    public Map<String, Object> createTaskWithFullResponse(@RequestBody Person person) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 检查重复逻辑
            Integer count = personMapper.countByUserAndTitle(person.getUserId(), person.getTitle());
            if (count > 0) {
                response.put("code", 409);
                response.put("message", "该用户下已存在相同标题的任务");
                return response;
            }

            int result = personMapper.insertOne(person);
            if (result > 0 && person.getId() != null) {
                response.put("code", 200);
                response.put("data", person);
                response.put("message", "创建成功");
            } else {
                response.put("code", 500);
                response.put("message", "创建失败");
            }
        } catch (DuplicateKeyException e) {
            // 捕获数据库唯一约束异常
            response.put("code", 409);
            response.put("message", "任务标题重复");
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "服务器错误: " + e.getMessage());
        }
        return response;
    }

    @Data
    @AllArgsConstructor
    public static class CategoryStat {
        private String category;
        private Integer total;
        private Integer completed;
    }

    @GetMapping("/person/{id}/safe")
    public ResponseEntity<Person> getTaskSafely(
            @PathVariable Integer id,
            @RequestParam String userId) {
        Person task = personMapper.selectByIdAndUserId(id, userId);
        return task != null ? ResponseEntity.ok(task) : ResponseEntity.notFound().build();
    }

    //小程序检测标题重复
    @PutMapping("/person/v2/{id}")
    public Map<String, Object> updateTaskV2(@PathVariable Integer id, @RequestBody Person person) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. 获取原任务信息
            Person original = personMapper.selectByIdAndUserId(id, person.getUserId());
            if (original == null) {
                response.put("code", 404);
                response.put("message", "任务不存在");
                return response;
            }

            // 2. 检查标题是否修改
            if (!original.getTitle().equals(person.getTitle())) {
                // 3. 检查新标题是否存在
                Integer count = personMapper.countByUserAndTitleExcludeId(
                        person.getUserId(),
                        person.getTitle(),
                        id
                );
                if (count > 0) {
                    response.put("code", 409);
                    response.put("message", "任务名称已存在");
                    return response;
                }
            }

            // 4. 执行更新
            int result = personMapper.updateById(person);
            if (result > 0) {
                response.put("code", 200);
                response.put("data", person);
                response.put("message", "更新成功");
            } else {
                response.put("code", 500);
                response.put("message", "更新失败");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "服务器错误: " + e.getMessage());
        }
        return response;
    }
}