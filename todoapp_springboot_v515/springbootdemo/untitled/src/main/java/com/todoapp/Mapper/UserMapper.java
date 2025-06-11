// UserMapper.java
package com.todoapp.Mapper;

import com.todoapp.pojo.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user WHERE userId = #{userId}")
    User findByUserId(String userId);

    @Insert("INSERT INTO user(userId, password) VALUES(#{userId}, #{password})")
    int insert(User user);

    @Update("UPDATE user SET password = #{newPassword} WHERE userId = #{userId}")
    int updatePassword(@Param("userId") String userId, @Param("newPassword") String newPassword);
}