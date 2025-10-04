import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UserPermissionsDto {
    @Expose({ name: 'can_manage_devices' })
    @ApiProperty({ description: 'Indicates if the user can manage devices.' })
    canManageDevices: boolean;

    @Expose({ name: 'can_manage_policies' })
    @ApiProperty({ description: 'Indicates if the user can manage policies.' })
    canManagePolicies: boolean;

    @Expose({ name: 'can_view_logs' })
    @ApiProperty({ description: 'Indicates if the user can view logs.' })
    canViewLogs: boolean;

    @Expose({ name: 'can_manage_users' })
    @ApiProperty({ description: 'Indicates if the user can manage users.' })
    canManageUsers: boolean;

    @Expose({ name: 'can_manage_network' })
    @ApiProperty({ description: 'Indicates if the user can manage network settings.' })
    canManageNetwork: boolean;

    @Expose({ name: 'can_manage_blocklists' })
    @ApiProperty({ description: 'Indicates if the user can manage blocklists.' })
    canManageBlocklists: boolean;

    @Expose({ name: 'can_manage_scheduled_tasks' })
    @ApiProperty({ description: 'Indicates if the user can manage scheduled tasks.' })
    canManageScheduledTasks: boolean;
}