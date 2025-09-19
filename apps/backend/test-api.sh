#!/bin/bash

# Task Flow Pro API 快速测试脚本
# 使用方法: ./test-api.sh [endpoint]

BASE_URL="http://localhost:3001"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${2}${1}${NC}"
}

# 测试健康检查
test_health() {
    print_message "🔍 测试健康检查..." $BLUE
    curl -s "$BASE_URL/api/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health"
    echo
}

# 测试数据库连接
test_database() {
    print_message "🔍 测试数据库连接..." $BLUE
    curl -s "$BASE_URL/api/health/test-db" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health/test-db"
    echo
}

# 测试获取所有项目
test_projects() {
    print_message "🔍 获取所有项目..." $BLUE
    curl -s "$BASE_URL/api/projects" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/projects"
    echo
}

# 测试创建项目
test_create_project() {
    print_message "🔍 创建测试项目..." $BLUE
    curl -s -X POST "$BASE_URL/api/projects" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "API测试项目",
            "ownerId": "test-user-123",
            "visibility": "PRIVATE",
            "description": "通过脚本创建的测试项目"
        }' | jq '.' 2>/dev/null || echo "创建项目失败"
    echo
}

# 测试获取单个项目
test_get_project() {
    local project_id="$1"
    if [ -z "$project_id" ]; then
        print_message "❌ 请提供项目ID" $RED
        return
    fi
    
    print_message "🔍 获取项目: $project_id" $BLUE
    curl -s "$BASE_URL/api/projects/$project_id" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/projects/$project_id"
    echo
}

# 测试添加成员
test_add_member() {
    local project_id="$1"
    local user_id="$2"
    
    if [ -z "$project_id" ] || [ -z "$user_id" ]; then
        print_message "❌ 请提供项目ID和用户ID" $RED
        return
    fi
    
    print_message "🔍 添加成员到项目: $project_id" $BLUE
    curl -s -X POST "$BASE_URL/api/projects/$project_id/members" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$user_id\",
            \"role\": \"COLLABORATOR\"
        }" | jq '.' 2>/dev/null || echo "添加成员失败"
    echo
}

# 显示帮助信息
show_help() {
    print_message "🚀 Task Flow Pro API 测试脚本" $GREEN
    echo
    echo "使用方法:"
    echo "  $0 [command] [args...]"
    echo
    echo "可用命令:"
    echo "  health                    - 测试健康检查"
    echo "  database                  - 测试数据库连接"
    echo "  projects                  - 获取所有项目"
    echo "  create-project            - 创建测试项目"
    echo "  get-project <id>          - 获取指定项目"
    echo "  add-member <project_id> <user_id> - 添加项目成员"
    echo "  all                       - 运行所有基础测试"
    echo "  help                      - 显示此帮助信息"
    echo
    echo "示例:"
    echo "  $0 health"
    echo "  $0 create-project"
    echo "  $0 get-project project123"
    echo "  $0 add-member project123 user456"
    echo "  $0 all"
}

# 运行所有基础测试
run_all_tests() {
    print_message "🚀 运行所有基础测试..." $GREEN
    echo
    
    test_health
    test_database
    test_projects
    test_create_project
    
    print_message "✅ 基础测试完成" $GREEN
}

# 主函数
main() {
    case "$1" in
        "health")
            test_health
            ;;
        "database")
            test_database
            ;;
        "projects")
            test_projects
            ;;
        "create-project")
            test_create_project
            ;;
        "get-project")
            test_get_project "$2"
            ;;
        "add-member")
            test_add_member "$2" "$3"
            ;;
        "all")
            run_all_tests
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            print_message "❌ 未知命令: $1" $RED
            show_help
            ;;
    esac
}

main "$@"
