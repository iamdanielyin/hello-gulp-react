/**
 * 初始化Mongoose提示信息
 * @param mongoose
 */
module.exports = function (mongoose) {
    mongoose.Error.messages.general = {};
    mongoose.Error.messages.general.default = "`{PATH}`的值`{VALUE}`无法通过验证";
    mongoose.Error.messages.general.required = "`{PATH}`的值不能为空哦～.";

    mongoose.Error.messages.Number = {};
    mongoose.Error.messages.Number.min = "`{PATH}`的值 ({VALUE}) 不能小于最小值 ({MIN}).";
    mongoose.Error.messages.Number.max = "`{PATH}`的值 ({VALUE}) 不能大于最大值 ({MAX}).";

    mongoose.Error.messages.Date = {};
    mongoose.Error.messages.Date.min = "`{PATH}`的值 ({VALUE}) 不能小于最小日期 ({MIN}).";
    mongoose.Error.messages.Date.max = "`{PATH}`的值 ({VALUE}) 不能大于最大日期 ({MAX}).";

    mongoose.Error.messages.String = {};
    mongoose.Error.messages.String.enum = "`{PATH}`的值`{VALUE}` 只能为固定的枚举值.";
    mongoose.Error.messages.String.match = "`{PATH}`的值({VALUE})不合法.";
    mongoose.Error.messages.String.minlength = "`{PATH}`的值(`{VALUE}`)长度不能小于({MINLENGTH}).";
    mongoose.Error.messages.String.maxlength = "`{PATH}`的值(`{VALUE}`)长度不能大于({MAXLENGTH}).";
};