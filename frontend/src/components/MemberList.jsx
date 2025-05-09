
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from 'lucide-react';

export const MemberList = ({ members }) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No contacts found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Account</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member._id}>
              <TableCell className="font-medium flex items-center space-x-2">
                <Avatar className="h-8 w-8 bg-primary text-white">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <span>{member.name.charAt(0).toUpperCase()}</span>
                  )}
                </Avatar>
                <span>{member.name}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">{member.email}</TableCell>
              <TableCell className="hidden md:table-cell">{member.accountNumber || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
