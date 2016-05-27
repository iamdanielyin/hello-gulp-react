/**
 * 默认配置文件
 * Created by yinfx on 16-1-19.
 */
module.exports = AdminConfig = {
    "name": "ibird",
    "adminEmails": [
        "13538828221@qq.com",
        "yinfxs@gmail.com",
        "yinfxs"
    ],
    "modules": {
        "system": {
            "label": "系统设置",
            "menus": {
                "users": {
                    "label": "系统用户",
                    "icon": "icon-users",
                    "collections": {
                        "user": {
                            "label": "用户管理",
                            "icon": "icon-user",
                            "schema": {
                                "code": {
                                    "type": "String",
                                    "label": "编码",
                                    "autoform":'<autofrom-act/>'
                                },
                                "name": {
                                    "type": "String",
                                    "label": "名称"
                                },
                                "createdAt": {
                                    "type": "Date",
                                    "label": "创建日期"
                                }
                            },
                            "templates": {
                                "new": {},
                                "edit": {},
                                "view": {}
                            }
                        },
                        "org": {
                            "label": "组织管理",
                            "icon": "icon-org",
                            "schema": {
                                "code": {
                                    "type": "String",
                                    "label": "编码"
                                },
                                "name": {
                                    "type": "String",
                                    "label": "名称"
                                },
                                "createdAt": {
                                    "type": "Date",
                                    "label": "创建日期"
                                }
                            }
                        },
                        "area": {
                            "label": "区域管理",
                            "icon": "icon-area",
                            "schema": {
                                "code": {
                                    "type": "String",
                                    "label": "编码"
                                },
                                "name": {
                                    "type": "String",
                                    "label": "名称"
                                },
                                "createdAt": {
                                    "type": "Date",
                                    "label": "创建日期"
                                }
                            }
                        }
                    }
                },
                "settings": {
                    "label": "系统设置",
                    "icon": "icon-settings",
                    "collections": {
                        "params": {
                            "label": "参数设置",
                            "icon": "icon-bars",
                            "schema": {
                                "code": {
                                    "type": "String",
                                    "label": "编码"
                                },
                                "name": {
                                    "type": "String",
                                    "label": "名称"
                                },
                                "createdAt": {
                                    "type": "Date",
                                    "label": "创建日期"
                                }
                            }
                        },
                        "public": {
                            "label": "公共设置",
                            "icon": "icon-other",
                            "schema": {
                                "code": {
                                    "type": "String",
                                    "label": "编码"
                                },
                                "name": {
                                    "type": "String",
                                    "label": "名称"
                                },
                                "createdAt": {
                                    "type": "Date",
                                    "label": "创建日期"
                                }
                            }
                        }
                    }
                }
            }
        },
        "content": {
            "label": "内容管理",
            "menus": "..."
        }
    }
};