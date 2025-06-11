package com.todoapp.pojo;

import lombok.Data;

@Data
public class Person {
    private Integer id;
    private String title;
    private String description;
    private String category;
    private String dueDate;
    private String userId;
    private String remindTime;
    private String status;

}
