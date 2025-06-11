// PersonMapper.java
package com.todoapp.Mapper;

import com.todoapp.controller.PersonController;
import com.todoapp.pojo.Person;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PersonMapper {

    @Select("SELECT * FROM person")
    List<Person> queryALL();

    @Select("SELECT * FROM person WHERE id = #{id}")
    Person selectById(Integer id);



    @Insert("INSERT INTO person(title, description, category, dueDate, userId, remindTime, status) " +
            "VALUES(#{title}, #{description}, #{category}, #{dueDate}, #{userId}, #{remindTime}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    Integer insertOne(Person person);

    @Delete("DELETE FROM person WHERE id = #{id}")
    Integer deleteById(Integer id);

    @Update("UPDATE person SET " +
            "title = #{title}, " +
            "description = #{description}, " +
            "category = #{category}, " +
            "dueDate = #{dueDate}, " +
            "userId = #{userId}, " +
            "remindTime = #{remindTime}, " +
            "status = #{status} " +
            "WHERE id = #{id}")
    Integer updateById(Person person);



    @Update("UPDATE person SET status = #{status} WHERE id = #{id}")
    Integer updateStatus(@Param("id") Integer id, @Param("status") String status);

    @Select("<script>" +
            "SELECT * FROM person " +
            "<where>" +
            "  <if test='userId != null and userId != \"\"'>AND userId = #{userId}</if>" +
            "  <if test='title != null and title != \"\"'>AND title LIKE CONCAT('%', #{title}, '%')</if>" +
            "  <if test='category != null and category != \"\"'>AND category = #{category}</if>" +
            "</where>" +
            "</script>")
    List<Person> searchByConditions(@Param("userId") String userId,
                                    @Param("title") String title,
                                    @Param("category") String category);



    @Deprecated
    @Delete("DELETE FROM person WHERE title = #{title}")
    Integer deleteByTitle(@Param("title") String title);


    /**
     * 获取分类统计信息
     * @param userId 必须的用户ID
     * @param range 时间范围：week/month/year
     * @return 分类统计数据列表
     */
    @Select("<script>" +
            "SELECT category, COUNT(*) AS total, " +
            "SUM(CASE WHEN status = '完成' THEN 1 ELSE 0 END) AS completed " +
            "FROM person " +
            "WHERE userId = #{userId} " +
            "<if test='range == \"week\"'>AND YEARWEEK(dueDate, 1) = YEARWEEK(NOW(), 1)</if>" +
            "<if test='range == \"month\"'>AND DATE_FORMAT(dueDate, '%Y%m') = DATE_FORMAT(NOW(), '%Y%m')</if>" +
            "<if test='range == \"year\"'>AND YEAR(dueDate) = YEAR(NOW())</if>" +
            "GROUP BY category</script>")
    List<PersonController.CategoryStat> getCategoryStats(@Param("userId") String userId,
                                                         @Param("range") String range);

    @Select("SELECT * FROM person WHERE id = #{id} AND userId = #{userId}")
    Person selectByIdAndUserId(@Param("id") Integer id, @Param("userId") String userId);

    @Select("SELECT COUNT(*) FROM person WHERE userId = #{userId} AND title = #{title}")
    Integer countByUserAndTitle(@Param("userId") String userId, @Param("title") String title);


    @Select("SELECT COUNT(*) FROM person WHERE userId = #{userId} AND title = #{title} AND id != #{excludeId}")
    Integer countByUserAndTitleExcludeId(@Param("userId") String userId,
                                         @Param("title") String title,
                                         @Param("excludeId") Integer excludeId);
}