# GigGatek Monitoring Runbooks

This document provides step-by-step procedures for responding to common alerts in the GigGatek system. Each runbook outlines the alert description, potential causes, and remediation steps.

## Table of Contents

- [GigGatek Monitoring Runbooks](#giggatek-monitoring-runbooks)
  - [Table of Contents](#table-of-contents)
  - [System Resource Alerts](#system-resource-alerts)
    - [High CPU Usage](#high-cpu-usage)
    - [High Memory Usage](#high-memory-usage)
    - [High Disk Usage](#high-disk-usage)
    - [Instance Down](#instance-down)
  - [Database Alerts](#database-alerts)
    - [MySQL Down](#mysql-down)
    - [MySQL High Threads Running](#mysql-high-threads-running)
    - [MySQL Slow Queries](#mysql-slow-queries)
  - [Cache Alerts](#cache-alerts)
    - [Redis Down](#redis-down)
    - [Redis Out of Memory](#redis-out-of-memory)
  - [Application Alerts](#application-alerts)
    - [High HTTP Error Rate](#high-http-error-rate)
    - [Slow HTTP Response](#slow-http-response)
  - [Business Alerts](#business-alerts)
    - [Payment Processing Errors](#payment-processing-errors)
    - [Order Processing Delayed](#order-processing-delayed)
    - [Rental Contract Creation Failed](#rental-contract-creation-failed)
    - [High Authentication Failures](#high-authentication-failures)

## System Resource Alerts

### High CPU Usage

**Alert**: HighCpuLoad

**Description**: CPU load is above 80% for more than 5 minutes.

**Potential Causes**:
- High application load/traffic
- Runaway processes or infinite loops
- Background tasks consuming excessive resources
- Insufficient server capacity

**Remediation Steps**:
1. Check system load with `top` or `htop` to identify high CPU processes:
   ```bash
   top -c
   ```
2. Look for processes consuming excessive CPU:
   ```bash
   ps aux --sort=-%cpu | head -n 10
   ```
3. For web server issues, check active connections:
   ```bash
   netstat -tunapl | grep ESTABLISHED | wc -l
   ```
4. If a specific process is causing issues, investigate or restart it:
   ```bash
   systemctl restart <service-name>
   ```
5. If normal load pattern, consider scaling up resources:
   - Increase CPU allocation in Docker/kubernetes
   - Add more application instances behind load balancer

**Escalation**: If CPU remains high after restart or scaling, escalate to the infrastructure team.

### High Memory Usage

**Alert**: HighMemoryUsage

**Description**: Memory usage is above 85% for more than 5 minutes.

**Potential Causes**:
- Memory leaks in application code
- Insufficient memory allocation
- Database queries loading large datasets into memory
- Incorrect JVM/container memory settings

**Remediation Steps**:
1. Check memory usage patterns:
   ```bash
   free -h
   ```
2. Identify processes consuming high memory:
   ```bash
   ps aux --sort=-%mem | head -n 10
   ```
3. Check for memory leaks in application logs
4. For database-related issues, verify connection pooling:
   ```bash
   mysql -u root -p -e "SHOW STATUS LIKE 'Conn%';"
   ```
5. If the issue is with a specific service, restart it:
   ```bash
   systemctl restart <service-name>
   ```
6. If memory pressure persists, increase memory allocation or scale out

**Escalation**: If memory issues persist after service restart or memory increase, escalate to the development team for possible memory leak investigation.

### High Disk Usage

**Alert**: HighDiskUsage

**Description**: Disk usage is above 85% for more than 5 minutes.

**Potential Causes**:
- Log files growing too large
- Database growth
- File uploads consuming space
- Temporary files not being cleaned up
- Docker images/volumes not pruned

**Remediation Steps**:
1. Check disk usage by directory:
   ```bash
   df -h
   du -h --max-depth=1 /
   ```
2. Look for large files:
   ```bash
   find / -type f -size +100M -exec ls -lh {} \;
   ```
3. Check and rotate logs if needed:
   ```bash
   journalctl --vacuum-size=500M
   ```
4. Clean up Docker resources if applicable:
   ```bash
   docker system prune -a
   ```
5. Remove temporary files:
   ```bash
   find /tmp -type f -mtime +7 -delete
   ```
6. If database is the issue, check table sizes and consider cleanup/archiving

**Escalation**: If disk cannot be freed sufficiently, escalate to infrastructure team for disk expansion.

### Instance Down

**Alert**: InstanceDown

**Description**: A monitored instance is not responding for more than 3 minutes.

**Potential Causes**:
- Service crash or hang
- Host machine issues
- Network connectivity problems
- Resource exhaustion
- Deployment or configuration errors

**Remediation Steps**:
1. Verify if the instance is truly down or just unreachable:
   ```bash
   ping <instance-ip>
   telnet <instance-ip> <port>
   ```
2. Check the service status:
   ```bash
   systemctl status <service-name>
   ```
3. Check for recent errors in the service logs:
   ```bash
   journalctl -u <service-name> -n 100 --no-pager
   ```
4. Restart the service:
   ```bash
   systemctl restart <service-name>
   ```
5. If Docker/Container based, check container status:
   ```bash
   docker ps -a | grep <container-name>
   docker logs <container-name>
   docker restart <container-name>
   ```
6. Verify system resources (CPU, memory, disk) aren't exhausted

**Escalation**: If service cannot be restarted or crashes again quickly, escalate to the development and infrastructure teams.

## Database Alerts

### MySQL Down

**Alert**: MySQLDown

**Description**: MySQL database instance is not responding.

**Potential Causes**:
- Database process crashed
- High load causing unresponsiveness
- Disk space exhaustion
- Configuration errors
- Corruption of data files

**Remediation Steps**:
1. Check MySQL service status:
   ```bash
   systemctl status mysql
   ```
2. Check MySQL error logs:
   ```bash
   tail -100 /var/log/mysql/error.log
   ```
3. Check disk space:
   ```bash
   df -h
   ```
4. Attempt to restart MySQL:
   ```bash
   systemctl restart mysql
   ```
5. If MySQL won't start, check for corruption:
   ```bash
   mysqlcheck -A -c
   ```
6. If the instance is clustered, check if failover occurred

**Escalation**: If database cannot be restarted or data corruption is suspected, escalate to the database administration team immediately.

### MySQL High Threads Running

**Alert**: MySQLHighThreadsRunning

**Description**: MySQL has a high number of threads running, indicating possible query contention or excessive connections.

**Potential Causes**:
- Query bottlenecks or locks
- Connection pool misconfiguration
- Inefficient queries causing long execution times
- High traffic spike

**Remediation Steps**:
1. Check current thread usage:
   ```bash
   mysql -e "SHOW GLOBAL STATUS LIKE 'Thread%';"
   ```
2. Look for blocking or long-running queries:
   ```bash
   mysql -e "SHOW PROCESSLIST;" | grep -v "Sleep"
   ```
3. Check for table locks:
   ```bash
   mysql -e "SHOW OPEN TABLES WHERE In_use > 0;"
   ```
4. Identify and kill problematic queries if necessary:
   ```bash
   mysql -e "KILL QUERY <thread_id>;"
   ```
5. Check connection pooling settings in application config
6. Review slow query log for optimization opportunities

**Escalation**: If thread contention persists, escalate to the database team for in-depth analysis.

### MySQL Slow Queries

**Alert**: MySQLSlowQueries

**Description**: Excessive number of slow queries detected in MySQL.

**Potential Causes**:
- Missing or inefficient indexes
- Complex joins or subqueries
- Large result sets
- Table locking issues
- Server resource constraints

**Remediation Steps**:
1. Check slow query log:
   ```bash
   tail -100 /var/log/mysql/mysql-slow.log
   ```
2. Analyze slow queries with EXPLAIN:
   ```bash
   mysql -e "EXPLAIN <problematic-query>;"
   ```
3. Check table indexes:
   ```bash
   mysql -e "SHOW INDEX FROM <table>;"
   ```
4. Check for table fragmentation and optimize if needed:
   ```bash
   mysql -e "OPTIMIZE TABLE <table>;"
   ```
5. Temporarily increase query cache if appropriate:
   ```bash
   mysql -e "SET GLOBAL query_cache_size = 67108864;"
   ```

**Escalation**: If slow queries persist, escalate to the development team for query optimization and to the DBA team for index analysis.

## Cache Alerts

### Redis Down

**Alert**: RedisDown

**Description**: Redis instance is not responding.

**Potential Causes**:
- Redis process crashed
- Memory exhaustion
- Configuration errors
- Network connectivity issues

**Remediation Steps**:
1. Check Redis service status:
   ```bash
   systemctl status redis
   ```
2. Check Redis logs:
   ```bash
   tail -100 /var/log/redis/redis-server.log
   ```
3. Attempt to connect to Redis:
   ```bash
   redis-cli ping
   ```
4. Check memory usage:
   ```bash
   redis-cli info memory
   ```
5. Restart Redis service:
   ```bash
   systemctl restart redis
   ```
6. Verify connectivity from application servers

**Escalation**: If Redis cannot be restarted or persists in crashing, escalate to the infrastructure team.

### Redis Out of Memory

**Alert**: RedisOutOfMemory

**Description**: Redis memory usage is above 90% of available memory.

**Potential Causes**:
- Insufficient maxmemory setting
- No eviction policy or inappropriate policy
- Large keys storing excessive data
- Memory fragmentation
- Too many keys stored

**Remediation Steps**:
1. Check Redis memory stats:
   ```bash
   redis-cli info memory
   ```
2. Check current memory policy:
   ```bash
   redis-cli config get maxmemory-policy
   ```
3. Identify large keys:
   ```bash
   redis-cli --bigkeys
   ```
4. If appropriate, modify eviction policy temporarily:
   ```bash
   redis-cli config set maxmemory-policy allkeys-lru
   ```
5. If safe, flush inactive keys:
   ```bash
   # Use with extreme caution!
   redis-cli keys "session:*" | xargs redis-cli del
   ```
6. Check memory fragmentation ratio and restart Redis if above 1.5

**Escalation**: If memory issues persist, escalate to development team to review Redis usage patterns and data storage.

## Application Alerts

### High HTTP Error Rate

**Alert**: HighHttpErrorRate

**Description**: HTTP 5xx error rate is above 5% for more than 5 minutes.

**Potential Causes**:
- Application bugs or exceptions
- Database connectivity issues
- Upstream service dependencies failing
- Resource exhaustion
- Recent deployment issues

**Remediation Steps**:
1. Check application error logs:
   ```bash
   tail -100 /var/log/giggatek/application-error.log
   ```
2. Check web server error logs:
   ```bash
   tail -100 /var/log/apache2/error.log
   ```
3. Verify database connectivity:
   ```bash
   mysql -h <db-host> -u <user> -p -e "SELECT 1;"
   ```
4. Check for recent deployments and consider rollback if correlated
5. Restart application services:
   ```bash
   systemctl restart uwsgi
   systemctl restart apache2
   ```
6. Check for external service dependencies and their status

**Escalation**: If errors persist after restart, escalate to the development team with collected logs.

### Slow HTTP Response

**Alert**: HttpServiceResponseSlow

**Description**: HTTP request completion time is above 2 seconds for 90th percentile.

**Potential Causes**:
- Database query performance
- External API call delays
- Application code inefficiencies
- Resource constraints (CPU/memory)
- Network latency

**Remediation Steps**:
1. Check system resources:
   ```bash
   top -c
   ```
2. Check database performance:
   ```bash
   mysql -e "SHOW FULL PROCESSLIST;"
   ```
3. Check application logs for slow operations:
   ```bash
   grep "took\|elapsed\|duration" /var/log/giggatek/application.log
   ```
4. Check network performance:
   ```bash
   ping <upstream-dependency>
   ```
5. Review recent code deployments
6. Restart application if appropriate

**Escalation**: If performance issues persist, escalate to development team with collected performance data.

## Business Alerts

### Payment Processing Errors

**Alert**: PaymentProcessingErrors

**Description**: More than 5 payment errors recorded in the last 15 minutes.

**Potential Causes**:
- Stripe API connectivity issues
- API key or configuration problems
- Data validation failures
- Webhook processing errors
- Customer payment method issues

**Remediation Steps**:
1. Check payment service logs:
   ```bash
   tail -100 /var/log/giggatek/payment.log
   ```
2. Verify Stripe API status at https://status.stripe.com/
3. Check Stripe dashboard for recent failed payments
4. Verify webhook configuration in Stripe dashboard
5. Check connectivity to Stripe API:
   ```bash
   curl -I https://api.stripe.com/v1/
   ```
6. Ensure API keys are correctly configured:
   ```bash
   grep -r "STRIPE_API" /etc/giggatek/ --include="*.conf"
   ```

**Escalation**: If payment issues persist, escalate to the payment team and consider business impact mitigation (customer communication).

### Order Processing Delayed

**Alert**: OrderProcessingDelayed

**Description**: 90% of orders are taking more than 30 seconds to process.

**Potential Causes**:
- Database performance issues
- Payment gateway slowness
- Inventory check bottlenecks
- Email notification delays
- Background job queue backlog

**Remediation Steps**:
1. Check order processing logs:
   ```bash
   tail -100 /var/log/giggatek/orders.log
   ```
2. Verify database performance:
   ```bash
   mysql -e "SHOW PROCESSLIST;"
   ```
3. Check payment gateway status
4. Look for blocked background jobs:
   ```bash
   systemctl status giggatek-worker
   ```
5. Check job queue status:
   ```bash
   redis-cli -n 1 llen order_queue
   ```
6. Restart order processing service if needed:
   ```bash
   systemctl restart giggatek-order-service
   ```

**Escalation**: If delays persist, escalate to the orders team and consider temporary customer messaging about processing delays.

### Rental Contract Creation Failed

**Alert**: RentalContractCreationFailed

**Description**: More than 3 rental contract failures in the last 30 minutes.

**Potential Causes**:
- Contract template issues
- Database transaction failures
- Payment scheduling errors
- Validation rule failures
- Customer credit check issues

**Remediation Steps**:
1. Check rental service logs:
   ```bash
   tail -100 /var/log/giggatek/rentals.log
   ```
2. Verify database integrity:
   ```bash
   mysql -e "CHECK TABLE rental_contracts;"
   ```
3. Look for specific error patterns in the logs:
   ```bash
   grep "contract.*failed\|error" /var/log/giggatek/rentals.log
   ```
4. Check document generation service:
   ```bash
   systemctl status giggatek-document-service
   ```
5. Verify configuration of rental terms and rates:
   ```bash
   mysql -e "SELECT * FROM rental_plans WHERE status = 'active';"
   ```
6. Restart rental processing service:
   ```bash
   systemctl restart giggatek-rental-service
   ```

**Escalation**: If contract failures continue, escalate to the rental team and legal team if contract terms appear to be the issue.

### High Authentication Failures

**Alert**: HighAuthenticationFailures

**Description**: More than 20 authentication failures in the last 15 minutes.

**Potential Causes**:
- Brute force attack attempts
- Stored credential issues
- LDAP/SSO integration problems
- User database corruption
- Session management issues

**Remediation Steps**:
1. Check auth service logs:
   ```bash
   tail -100 /var/log/giggatek/auth.log
   ```
2. Look for patterns in authentication failures:
   ```bash
   grep "authentication failed\|login failed" /var/log/giggatek/auth.log | awk '{print $3}' | sort | uniq -c | sort -nr
   ```
3. Check for unusual IP patterns:
   ```bash
   grep "authentication failed" /var/log/giggatek/auth.log | awk '{print $4}' | sort | uniq -c | sort -nr | head -10
   ```
4. Verify database auth tables:
   ```bash
   mysql -e "SELECT COUNT(*) FROM users;"
   ```
5. For potential attacks, temporarily increase login throttling:
   ```bash
   # Adjust rate limiting in application config
   sed -i 's/max_attempts=5/max_attempts=3/' /etc/giggatek/auth.conf
   systemctl restart giggatek-auth-service
   ```

**Escalation**: If attack is suspected, escalate to security team. If system issue persists, escalate to development team.
