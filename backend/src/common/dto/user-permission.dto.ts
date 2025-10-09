import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionsDto {
  @ApiProperty({ description: 'Indicates if the user can manage devices.' })
  canManageDevices: boolean;

  @ApiProperty({ description: 'Indicates if the user can manage policies.' })
  canManagePolicies: boolean;

  @ApiProperty({ description: 'Indicates if the user can view logs.' })
  canViewLogs: boolean;

  @ApiProperty({ description: 'Indicates if the user can manage users.' })
  canManageUsers: boolean;

  @ApiProperty({
    description: 'Indicates if the user can manage network settings.',
  })
  canManageNetwork: boolean;

  @ApiProperty({ description: 'Indicates if the user can manage blocklists.' })
  canManageBlocklists: boolean;

  @ApiProperty({
    description: 'Indicates if the user can manage scheduled tasks.',
  })
  canManageScheduledTasks: boolean;
}
