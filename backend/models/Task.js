module.exports = (sequelize , DataTypes) =>{
    const Task = sequelize.define(
        'Task'
    , {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement : true,
            primaryKey : true
        },
        user_id :{
            type : DataTypes.INTEGER,
            allowNull : false,
            references :{
                model : 'User',
                key : 'id'
            },
            onUpdate : 'CASCADE'
        },
        project_id : {
            type : DataTypes.INTEGER,
            allowNull : false,
            references :{
                model : 'Project',
                key : 'id'
            },
            onDelete : 'CASCADE',
            onUpdate : 'CASCADE'
        },
        name : {
            type : DataTypes.STRING(40),
            allowNull : false 
        },
        description : {
            type : DataTypes.STRING(255),
            allowNull : true
        }, 
        days_to_finish : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        state : {
            type : DataTypes.ENUM('in Progress' , 'done'),
            allowNull : false,
            defaultValue : 'in Progress'
        }
    },
        {
            timestamps : false ,
            tableName : 'Tasks'
        }
    );

 Task.associate = models => {
    Task.belongsTo(models.User , {
        foreignKey : 'user_id',
        onUpdate : 'CASCADE'
    });
    Task.belongsTo(models.Project , {
        foreignKey : 'project_id',
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
    });
 };

return Task;
}